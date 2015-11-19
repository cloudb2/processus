# Processus

Processus is a simple lightweight workflow engine designed to help orchestrate multiple tasks.

There are many workflow engines already, but Processus makes some very specific assumptions that make it easy to quickly write simple, yet powerful
workflows.

* [Installation](#installation)
* [Using Processus](#using-processus)
  * [Workflow](#workflow)
  * [Tasks](#tasks)
  * [Testing Tasks](#testing-tasks)
  * [Parallel Tasks](#parallel-tasks)
  * [Nested Tasks](#nested-tasks)
  * [Passing Data Between Tasks](#passing-data-between-tasks)
  * [Passing Static Data](#passing-static-data)
  * [Handling Errors](#handling-errors)
    * [ignoreError Property](#ignoreerror-property)
  * [Task Conditions - skipIf and errorIf](#task-conditions---skipif-and-errorif)
  * [Handlers](#handlers)
    * [requestHandler](#requestHandler)
    * [workflowHandler](#workflowHandler)
  * [Environment Variables](#environment-variables)

<hr>

#Getting Started

## Installation

Install using npm within your project
```
npm install --save processus
```

Install globally for use on the command line
```
npm install -g processus
```

or clone this repo
```
git clone https://github.com/cloudb2/processus
```

<hr>

## Using Processus

A workflow in Processus is defined using JSON, which should conform to a specific structure. The best way to understand that structure is by looking at examples.

### Workflow

A workflow, in it's simplest form, is defined as follows.
```
{
  "tasks": {
  },
  "id": "[instance UUID]"
  "status": "[open|error|completed]"
}
```
Both ```id``` and ```status``` are added by Processus at execution time.

execute the above example ex1.json using the following command.
```
../bin/processus-cli -l info -f ./test/ex1.json
```

You should see something like this.
```
$ ./bin/processus-cli -l info -f ./test/ex1.json

  ____  ____   __    ___  ____  ____  ____  _  _  ____
 (  _ \(  _ \ /  \  / __)(  __)/ ___)/ ___)/ )( \/ ___)
  ) __/ )   /(  O )( (__  ) _) \___  \___ \) \/ (\___ \
 (__)  (__\_) \__/  \___)(____)(____/(____/\____/(____/

           Processus: A Simple Workflow Engine.

2015-11-19 00:19:06 INFO reading workflow file ./test/ex1.json
2015-11-19 00:19:06 INFO ✰ Workflow [./test/ex1.json] with id [208810ae-14f3-4331-bd3f-adace417e38d] exited without error, but did not complete.
```
***Note***

1. You can add additional meta data to the workflow such as a name and description, but that will be ignored by Processus.
2. The status of a workflow can be open, error or completed.
3. In this example there are no tasks, so the Processus returns open, assuming that a task will be injected later. More on this later.

execute ex1 again, this time with a log level of debug.
```
../bin/processus-cli -l debug -f ./test/ex1.json
```

You should see something like this.
```
$ ./bin/processus-cli -l debug -f ./test/ex1.json

  ____  ____   __    ___  ____  ____  ____  _  _  ____
 (  _ \(  _ \ /  \  / __)(  __)/ ___)/ ___)/ )( \/ ___)
  ) __/ )   /(  O )( (__  ) _) \___  \___ \) \/ (\___ \
 (__)  (__\_) \__/  \___)(____)(____/(____/\____/(____/

           Processus: A Simple Workflow Engine.

2015-11-19 00:19:43 INFO reading workflow file ./test/ex1.json
2015-11-19 00:19:43 DEBUG checking for data directory
2015-11-19 00:19:43 DEBUG init complete without error.
2015-11-19 00:19:43 DEBUG save point a reached.
2015-11-19 00:19:43 DEBUG save point c reached.
2015-11-19 00:19:43 DEBUG Workflow returned successfully.
2015-11-19 00:19:43 DEBUG {
  "tasks": {},
  "status": "open",
  "id": "8a2467ad-ad05-4dca-92b8-aac815d7dbec"
}
2015-11-19 00:19:43 INFO ✰ Workflow [./test/ex1.json] with id [8a2467ad-ad05-4dca-92b8-aac815d7dbec] exited without error, but did not complete.
```
***Note***

1. The status and id have been added by Processus
2. The workflow remains open as there are NO tasks to execute

### Tasks

Consider the following workflow.
```
{
  "tasks": {
    "say hello": {
      "blocking": true,
      "handler": "../taskhandlers/execHandler",
      "data": {
        "cmd": "echo 'hello, world'"
      }
    },
    "say hello again": {
      "blocking": true,
      "handler": "../taskhandlers/execHandler",
      "data": {
        "cmd": "echo 'hello, world again'"
      }
    }
  }
}
```
***Note***

1. The above workflow has 2 tasks ```say hello``` and ```say hello again```.
2. Each task uses a handler called ```execHandler``` which executed the command identified in the data property of the task by ```data.cmd```.

So, in short, this simple workflow will execute ```echo 'hello, world'``` and ```echo 'hello, world again'``` sequentially.

execute ex2.json
```
../bin/processus-cli -l debug -f ./test/ex2.json
```

You should see something like this.
```
$ ./bin/processus-cli -l debug -f ./test/ex2.json

  ____  ____   __    ___  ____  ____  ____  _  _  ____
 (  _ \(  _ \ /  \  / __)(  __)/ ___)/ ___)/ )( \/ ___)
  ) __/ )   /(  O )( (__  ) _) \___  \___ \) \/ (\___ \
 (__)  (__\_) \__/  \___)(____)(____/(____/\____/(____/

           Processus: A Simple Workflow Engine.

2015-11-19 00:20:54 INFO reading workflow file ./test/ex2.json
2015-11-19 00:20:54 DEBUG checking for data directory
2015-11-19 00:20:54 DEBUG init complete without error.
2015-11-19 00:20:54 DEBUG save point a reached.
2015-11-19 00:20:54 DEBUG task.skipIf = undefined
2015-11-19 00:20:54 DEBUG task.errorIf = undefined
2015-11-19 00:20:54 INFO ⧖ Staring task say hello
2015-11-19 00:20:54 INFO stdout ➜ [hello, world
]
2015-11-19 00:20:54 INFO ✔ task [say hello] completed successfully.
2015-11-19 00:20:54 DEBUG save point a reached.
2015-11-19 00:20:54 DEBUG task.skipIf = undefined
2015-11-19 00:20:54 DEBUG task.errorIf = undefined
2015-11-19 00:20:54 INFO ⧖ Staring task say hello again
2015-11-19 00:20:54 INFO stdout ➜ [hello, world again
]
2015-11-19 00:20:54 INFO ✔ task [say hello again] completed successfully.
2015-11-19 00:20:54 DEBUG save point a reached.
2015-11-19 00:20:54 DEBUG save point c reached.
2015-11-19 00:20:54 DEBUG Workflow returned successfully.
2015-11-19 00:20:54 DEBUG {
  "tasks": {
    "say hello": {
      "blocking": true,
      "handler": "../taskhandlers/execHandler",
      "data": {
        "cmd": "echo 'hello, world'",
        "stdout": "hello, world\n",
        "stderr": ""
      },
      "status": "completed",
      "timeOpened": 1447892454206,
      "timeStarted": 1447892454208,
      "timeCompleted": 1447892454234,
      "handlerDuration": 26,
      "totalDuration": 28
    },
    "say hello again": {
      "blocking": true,
      "handler": "../taskhandlers/execHandler",
      "data": {
        "cmd": "echo 'hello, world again'",
        "stdout": "hello, world again\n",
        "stderr": ""
      },
      "status": "completed",
      "timeOpened": 1447892454237,
      "timeStarted": 1447892454238,
      "timeCompleted": 1447892454244,
      "handlerDuration": 6,
      "totalDuration": 7
    }
  },
  "status": "completed",
  "id": "9909133c-158a-4f0f-8778-99d7c378ef7d"
}
2015-11-19 00:20:54 INFO ✰ Workflow [./test/ex2.json] with id [9909133c-158a-4f0f-8778-99d7c378ef7d] completed successfully.
```
***Note***

1. The handler has added ```stdout``` and ```stderr``` to each task's ```data``` property.
2. The status of each task and the overall workflow is shown as ```completed```
3. Processus has added additional timing information to each task.
4. The status of a task can be one of the following
  * ```waiting``` It is waiting to be opened by Processus
  * ```open``` It is opened by Processus
  * ```executing``` The handler associated with this task is currently executing
  * ```completed``` The task has completed successfully
  * ```pending``` A handler has finished executing but a response is pending. i.e. it is expected that the workflow will be updated at some point in the future from an async callback.
  * ```error``` An error occured during execution of the handler

### Testing Tasks

Processus comes with a ```testHandler``` that mimics a task by waiting for a specific period of time and then returning.

Consider demo1.json
```
{
  "tasks":{
    "task 1": {
      "description": "I am the task 1, I take 1500msecs.",
      "blocking": true,
      "handler" : "../taskHandlers/testHandler",
      "data": {
        "delay": 1500,
        "error": false
      }
    },
    "task 2": {
      "description": "I am the task 2, I take 1000msecs.",
      "blocking": true,
      "handler" : "../taskHandlers/testHandler",
      "data": {
        "delay": 1000,
        "error": false
      }
    },
    "task 3": {
      "description": "I am the task 3, I take 500msecs.",
      "blocking": true,
      "handler" : "../taskHandlers/testHandler",
      "data": {
        "delay": 500,
        "error": false
      }
    }
  }
}
```

If you run this example the 3 tasks will execute as follows.

```
$ ./bin/processus-cli -l info -f ./test/demo1.json

  ____  ____   __    ___  ____  ____  ____  _  _  ____
 (  _ \(  _ \ /  \  / __)(  __)/ ___)/ ___)/ )( \/ ___)
  ) __/ )   /(  O )( (__  ) _) \___  \___ \) \/ (\___ \
 (__)  (__\_) \__/  \___)(____)(____/(____/\____/(____/

           Processus: A Simple Workflow Engine.

info: reading workflow file [./test/demo1.json]
info: ⧖ Starting task [task 1]
info: ✔ task task 1 completed successfully.
info: ⧖ Starting task [task 2]
info: ✔ task task 2 completed successfully.
info: ⧖ Starting task [task 3]
info: ✔ task task 3 completed successfully.
info: ✰ Workflow [./test/demo1.json] with id [79893dc3-7bcd-4596-bfc4-3c4380b04775] completed successfully.
```

### Parallel Tasks

Above, the tasks were executed in series (i.e. one after the other). It's possible to execute tasks in parallel by setting the ```blocking``` property of a task to ```false```.

Consider demo2.json
```
{
  "tasks":{
    "task 1": {
      "description": "I am the task 1, I take 1500msecs.",
      "blocking": false,
      "handler" : "../taskHandlers/testHandler",
      "data": {
        "delay": 1500,
        "error": false
      }
    },
    "task 2": {
      "description": "I am the task 2, I take 1000msecs.",
      "blocking": false,
      "handler" : "../taskHandlers/testHandler",
      "data": {
        "delay": 1000,
        "error": false
      }
    },
    "task 3": {
      "description": "I am the task 3, I take 500msecs.",
      "blocking": false,
      "handler" : "../taskHandlers/testHandler",
      "data": {
        "delay": 500,
        "error": false
      }
    }
  }
}
```

Executing ```demo2.json``` will result in the following.
```
$ ./bin/processus-cli -l info -f ./test/demo2.json

  ____  ____   __    ___  ____  ____  ____  _  _  ____
 (  _ \(  _ \ /  \  / __)(  __)/ ___)/ ___)/ )( \/ ___)
  ) __/ )   /(  O )( (__  ) _) \___  \___ \) \/ (\___ \
 (__)  (__\_) \__/  \___)(____)(____/(____/\____/(____/

           Processus: A Simple Workflow Engine.

info: reading workflow file [./test/demo2.json]
info: ⧖ Starting task [task 1]
info: ⧖ Starting task [task 2]
info: ⧖ Starting task [task 3]
info: ✔ task task 3 completed successfully.
info: ✔ task task 2 completed successfully.
info: ✔ task task 1 completed successfully.
info: ✰ Workflow [./test/demo2.json] with id [5aac5cff-e2a3-421a-abb8-7d01d564f4d8] completed successfully.
```
***Note***

1. All 3 tasks started before any had finished
2. The task completed in reverse order because the time difference

### Nested Tasks

Tasks can be nested as shown in ```demo3.json```

```
{
  "tasks":{
    "task 1": {
      "description": "I am the task 1, I take 1500msecs.",
      "blocking": true,
      "handler" : "../taskHandlers/testHandler",
      "data": {
        "delay": 1500,
        "error": false
      }
    },
    "task 2": {
      "description": "I am the task 2, I take 1000msecs.",
      "blocking": true,
      "handler" : "../taskHandlers/testHandler",
      "data": {
        "delay": 1000,
        "error": false
      },
      "tasks": {
        "task 2-1": {
          "description": "I am the task 2-1, I take 1000msecs.",
          "blocking": true,
          "handler" : "../taskHandlers/testHandler",
          "data": {
            "delay": 1000,
            "error": false
          }
        },
        "task 2-2": {
          "description": "I am the task 2-2, I take 1000msecs.",
          "blocking": true,
          "handler" : "../taskHandlers/testHandler",
          "data": {
            "delay": 1000,
            "error": false
          }
        }
      }
    },
    "task 3": {
      "description": "I am the task 3, I take 500msecs.",
      "blocking": true,
      "handler" : "../taskHandlers/testHandler",
      "data": {
        "delay": 500,
        "error": false
      }
    }
  }
}
```

**Notice** that ```task 2``` contains ```tasks``` itself.
Processus allows nesting of tasks and does not limit the level of nesting. This is a powerful feature, but it does make some assumptions:

1. The parent task opens directly after it's previous sibling
2. The parent task CANNOT complete until ALL the child tasks have completed
3. The parent task is therefore not executed until ALL of the children have completed
4. Setting the parent's blocking property to false will NOT prevent it being delayed until
the child tasks have completed. However, that will cause it to open in parallel with its
siblings.

Incidentally this is why a task's ```timeOpened``` time may differ from the ```timeStarted``` time. It's also why the ```totalDuration``` may be different from the ```handlerDuration```.

Running the demo
```
$ ./bin/processus-cli -l info -f ./test/demo3.json

  ____  ____   __    ___  ____  ____  ____  _  _  ____
 (  _ \(  _ \ /  \  / __)(  __)/ ___)/ ___)/ )( \/ ___)
  ) __/ )   /(  O )( (__  ) _) \___  \___ \) \/ (\___ \
 (__)  (__\_) \__/  \___)(____)(____/(____/\____/(____/

           Processus: A Simple Workflow Engine.

info: reading workflow file [./test/demo3.json]
info: ⧖ Starting task [task 1]
info: ✔ task task 1 completed successfully.
info: ⧖ Starting task [task 2-1]
info: ✔ task task 2-1 completed successfully.
info: ⧖ Starting task [task 2-2]
info: ✔ task task 2-2 completed successfully.
info: ⧖ Starting task [task 2]
info: ✔ task task 2 completed successfully.
info: ⧖ Starting task [task 3]
info: ✔ task task 3 completed successfully.
info: ✰ Workflow [./test/demo3.json] with id [7e1a009b-024b-4cd9-84f2-0c1fb3fcf9da] completed successfully.
```

**Notice** that task ```task 2-1``` and ```task 2-2``` are completed before the parent task ```task 2``` is executed.

### Passing Data Between Tasks

Processus supports a very simple mechanism for referencing data between tasks.

The format is ```$[<path.to.reference>]```

For example, if a task has a data value of ```$[tasks.task 1.data.delay]``` this value will be substituted, at execution time, with the value stored in the delay data property of task 1.

Consider demo6.json
```
{
  "tasks":{
    "task 1": {
      "description": "I am the task 1, I take 1500msecs.",
      "blocking": true,
      "handler" : "../taskHandlers/testHandler",
      "data": {
        "delay": 1500,
        "error": false
      }
    },
    "task 2": {
      "description": "I am the task 2, I take as long as task1.",
      "blocking": true,
      "handler" : "../taskHandlers/testHandler",
      "data": {
        "delay": "$[tasks.task 1.data.delay]",
        "error": false
      }
    },
    "task 3": {
      "description": "I am the task 3, I take as long as task1.",
      "blocking": true,
      "handler" : "../taskHandlers/testHandler",
      "data": {
        "delay": "$[tasks.task 1.data.delay]",
        "error": false
      }
    }
  }
}
```

If you execute ```demo6.json``` in debug mode, you'll see that the delay property of tasks 2 and 3 match that of task 1.

```
$ ./bin/processus-cli -l debug -f ./test/demo6.json

  ____  ____   __    ___  ____  ____  ____  _  _  ____
 (  _ \(  _ \ /  \  / __)(  __)/ ___)/ ___)/ )( \/ ___)
  ) __/ )   /(  O )( (__  ) _) \___  \___ \) \/ (\___ \
 (__)  (__\_) \__/  \___)(____)(____/(____/\____/(____/

           Processus: A Simple Workflow Engine.

info: reading workflow file [./test/demo6.json]
...
[detail removed for clarity]
...
debug: Workflow returned successfully.
debug: {
  "tasks": {
    "task 1": {
      "description": "I am the task 1, I take 1500msecs.",
      "blocking": true,
      "handler": "../taskHandlers/testHandler",
      "data": {
        "delay": 1500,
        "error": false
      },
      "status": "completed",
      "timeOpened": 1447974646175,
      "timeStarted": 1447974646176,
      "timeCompleted": 1447974647682,
      "handlerDuration": 1506,
      "totalDuration": 1507
    },
    "task 2": {
      "description": "I am the task 2, I take as long as task1.",
      "blocking": true,
      "handler": "../taskHandlers/testHandler",
      "data": {
        "delay": "1500",
        "error": false
      },
      "status": "completed",
      "timeOpened": 1447974647685,
      "timeStarted": 1447974647687,
      "timeCompleted": 1447974649199,
      "handlerDuration": 1512,
      "totalDuration": 1514
    },
    "task 3": {
      "description": "I am the task 3, I take as long as task1.",
      "blocking": true,
      "handler": "../taskHandlers/testHandler",
      "data": {
        "delay": "1500",
        "error": false
      },
      "status": "completed",
      "timeOpened": 1447974649203,
      "timeStarted": 1447974649204,
      "timeCompleted": 1447974650715,
      "handlerDuration": 1511,
      "totalDuration": 1512
    }
  },
  "status": "completed",
  "id": "008bebca-a264-4e7e-9bb4-376f979689f6"
}
info: ✰ Workflow [./test/demo6.json] with id [008bebca-a264-4e7e-9bb4-376f979689f6] completed successfully.
```

### Passing Static Data

As with the earlier example, it's also possible to pass static data from the parent workflow to each task.

Consider demo7.json
```
{
  "static":{
    "global-delay":500,
    "global-error":false
  },
  "tasks":{
    "task 1": {
      "description": "I am the task 1, I take global-delay msecs, which is 500msecs.",
      "blocking": true,
      "handler" : "../taskHandlers/testHandler",
      "data": {
        "delay": "$[static.global-delay]",
        "error": "$[static.global-error]"
      }
    },
    "task 2": {
      "description": "I am the task 2, I take global-delay msecs, which is 500msecs.",
      "blocking": true,
      "handler" : "../taskHandlers/testHandler",
      "data": {
        "delay": "$[static.global-delay]",
        "error": "$[static.global-error]"
      }
    },
    "task 3": {
      "description": "I am the task 3, I take global-delay msecs, which is 500msecs.",
      "blocking": true,
      "handler" : "../taskHandlers/testHandler",
      "data": {
        "delay": "$[static.global-delay]",
        "error": "$[static.global-error]"
      }
    }
  }
}
```
In this case each task's ```delay``` property will be substituted with the ```global-delay``` property of the workflow.

### Handling Errors

The ```testHandler``` can force an error. To see the affect this has on the workflow consider demo8.json

```
{
  "tasks":{
    "task 1": {
      "description": "I am the task 1, I take 1500msecs.",
      "blocking": true,
      "handler" : "../taskHandlers/testHandler",
      "data": {
        "delay": 1500,
        "error": false
      }
    },
    "task 2": {
      "description": "I am the task 2, I take 1000msecs.",
      "blocking": true,
      "handler" : "../taskHandlers/testHandler",
      "data": {
        "delay": 1000,
        "error": true
      }
    },
    "task 3": {
      "description": "I am the task 3, I take 1500msecs.",
      "blocking": true,
      "handler" : "../taskHandlers/testHandler",
      "data": {
        "delay": 1500,
        "error": false
      }
    }
  }
}
```

Executing ```demo8.json``` results in the following
```
$ ./bin/processus-cli -l debug -f ./test/demo8.json

  ____  ____   __    ___  ____  ____  ____  _  _  ____
 (  _ \(  _ \ /  \  / __)(  __)/ ___)/ ___)/ )( \/ ___)
  ) __/ )   /(  O )( (__  ) _) \___  \___ \) \/ (\___ \
 (__)  (__\_) \__/  \___)(____)(____/(____/\____/(____/

           Processus: A Simple Workflow Engine.

info: reading workflow file [./test/demo8.json]
info: ⧖ Starting task [task 1]
info: ✔ task task 1 completed successfully.
info: ⧖ Starting task [task 2]
info: ✔ task task 2 completed successfully.
error: ✘ task [task 2] is raising a deliberate error
error: ✘ Workflow [./test/demo8.json] with id [81b1f5ae-2975-456c-b281-285f59aeecf0] exited with error!
debug: {
  "tasks": {
    "task 1": {
      "description": "I am the task 1, I take 1500msecs.",
      "blocking": true,
      "handler": "../taskHandlers/testHandler",
      "data": {
        "delay": 1500,
        "error": false
      },
      "status": "completed",
      "timeOpened": 1447974502977,
      "timeStarted": 1447974502978,
      "timeCompleted": 1447974504486,
      "handlerDuration": 1508,
      "totalDuration": 1509
    },
    "task 2": {
      "description": "I am the task 2, I take 1000msecs.",
      "blocking": true,
      "handler": "../taskHandlers/testHandler",
      "data": {
        "delay": 1000,
        "error": true
      },
      "status": "error",
      "timeOpened": 1447974504489,
      "timeStarted": 1447974504489,
      "errorMsg": "task [task 2] is raising a deliberate error"
    },
    "task 3": {
      "description": "I am the task 3, I take 1500msecs.",
      "blocking": true,
      "handler": "../taskHandlers/testHandler",
      "data": {
        "delay": 1500,
        "error": false
      },
      "status": "waiting"
    }
  },
  "status": "error",
  "id": "81b1f5ae-2975-456c-b281-285f59aeecf0"
}
```
***Note***

1.  Task 2 is in the ```error``` state and Processus has added the ```errorMsg``` property
2.  The workflow is also in the ```error``` state.
3.  Task 3 is in the ```waiting``` state.

#### ignoreError Property

It's possible for a task to have an ignoreError property. If set to true, any errors for a task will be logged in the ```errorMsg``` property and the task state will be set to ```completed```.

Execute ```demo8a.json``` to see this in action
```
$ ./bin/processus-cli -l info -f ./test/demo8a.json

  ____  ____   __    ___  ____  ____  ____  _  _  ____
 (  _ \(  _ \ /  \  / __)(  __)/ ___)/ ___)/ )( \/ ___)
  ) __/ )   /(  O )( (__  ) _) \___  \___ \) \/ (\___ \
 (__)  (__\_) \__/  \___)(____)(____/(____/\____/(____/

           Processus: A Simple Workflow Engine.

info: reading workflow file [./test/demo8a.json]
info: ⧖ Starting task [task 1]
info: ✔ task task 1 completed successfully.
info: ⧖ Starting task [task 2]
info: ✔ task task 2 completed successfully.
info: ignoring error, as requested for task [task 2]
info: ⧖ Starting task [task 3]
info: ✔ task task 3 completed successfully.
info: ✰ Workflow [./test/demo8a.json] with id [0f7033d7-3edf-4a8b-a4af-a0bc32c842f3] completed successfully.

```

### Task Conditions - skipIf and errorIf

Tasks can have the extra properties ```skipIf``` and ```errorIf```.

As the names suggest, if either property evaluates to true, then Processus will either skip the task and just mark it as completed or raise an error and stop.

As with sharing data values, you can reference another part of the workflow and have that substituted at execution time. Processus will evaluate the string condition and set property appropriately. Any string with the value ```true``` regardless of case, will evaluate to true. Any other string will evaluate to ```false```.

Look at demo10 to see an example of ```skipIf``` and ```errorIf``` in action.

```
{
  "tasks":{
    "task 1": {
      "description": "I am the task 1, I echo Processus",
      "blocking": true,
      "handler": "../taskHandlers/execHandler",
      "data": {
        "cmd": "echo Processus",
        "skip me": "true"
      }
    },
    "task 2": {
      "description": "I am the task 2, I will be skipped",
      "blocking": true,
      "skipIf":"$[tasks.task 1.data.skip me]",
      "handler": "../taskHandlers/execHandler",
      "data": {
        "cmd": "echo Simple"
      }
    },
    "task 3": {
      "description": "I am the task 3, I will error",
      "blocking": true,
      "errorIf": "$[tasks.task 2.skipIf]",
      "handler": "../taskHandlers/execHandler",
      "data": {
        "cmd": "echo Workflow"
      }
    }
  }
}
```

***Note***

1.  ```skipIf``` of ```task 2``` will evaluate to ```true``` causing this task to be skipped
2.  ```errorIf``` of ```task 3``` will evaluate to the same value of ```skipIf``` of the ```task 2``` causing this task to error

```
$ ./bin/processus-cli -l info -f test/demo10.json

  ____  ____   __    ___  ____  ____  ____  _  _  ____
 (  _ \(  _ \ /  \  / __)(  __)/ ___)/ ___)/ )( \/ ___)
  ) __/ )   /(  O )( (__  ) _) \___  \___ \) \/ (\___ \
 (__)  (__\_) \__/  \___)(____)(____/(____/\____/(____/

           Processus: A Simple Workflow Engine.

info: reading workflow file [test/demo10.json]
info: ⧖ Starting task [task 1]
info: ✔ task [task 1] completed successfully.
info: skipping [task 2]
error: ✘ Task [task 3] has error condition set.
error: ✘ Workflow [test/demo10.json] with id [90727723-da21-46e4-8ac3-b5e132b2bab8] exited with error!
```

### Handlers

Handlers are where the real work gets done in Processus and follow a simple interface.

```
function(workflowId, taskName, task, callback, logger)
```

***Note***

1.  workflowId is the UUID assigned to this instance of the workflow
2.  taskName is the name of the task
3.  task is an object containing all the properties of the task
4.  callback consists of an error object (or null) and the updated task

Processus comes with a number of task handlers. It's recommended that you study these, should you wish to write or extend your own. In addition to those mentioned above, there are other task handlers.

#### requestHandler

This handler wraps the very popular nodejs module request to make HTTP requests. Simply supply a ```data.options``` property to the task to see the resulting HTTP request made. ```demo12.json``` is an example of this.

```
{
  "tasks": {
    "call github for demo1": {
      "blocking": true,
      "handler": "../taskhandlers/requestHandler",
      "data": {
        "options": {
            "url": "https://raw.githubusercontent.com/cloudb2/processus/master/test/demo1.json",
            "method": "GET",
            "json": true
        }
      }
    }
  }
}
```

executing this demo will result in the request and body objects being populated in the task ```call github for demo1``` by the http request to ```https://raw.githubusercontent.com/cloudb2/processus/master/test/demo1.json```

```
$ ./bin/processus-cli -l debug -f test/demo12.json

  ____  ____   __    ___  ____  ____  ____  _  _  ____
 (  _ \(  _ \ /  \  / __)(  __)/ ___)/ ___)/ )( \/ ___)
  ) __/ )   /(  O )( (__  ) _) \___  \___ \) \/ (\___ \
 (__)  (__\_) \__/  \___)(____)(____/(____/\____/(____/

           Processus: A Simple Workflow Engine.

info: reading workflow file [test/demo12.json]
...
[detail removed for simplicity]
...
debug: Workflow returned successfully.
debug: {
  "tasks": {
    "call github for demo1": {
      "blocking": true,
      "handler": "../taskhandlers/requestHandler",
      "data": {
        "options": {
          "url": "https://raw.githubusercontent.com/cloudb2/processus/master/test/demo1.json",
          "method": "GET",
          "json": true
        },
        "response": {
          "statusCode": 200,
          "body": {
            "tasks": {
              "task 1": {
                "description": "I am the task 1, I take 1500msecs.",
                "blocking": true,
                "handler": "../taskHandlers/testHandler",
                "data": {
                  "delay": 1500,
                  "error": false
                }
              },
              "task 2": {
                "description": "I am the task 2, I take 1000msecs.",
                "blocking": true,
                "handler": "../taskHandlers/testHandler",
                "data": {
                  "delay": 1000,
                  "error": false
                }
              },
              "task 3": {
                "description": "I am the task 3, I take 500msecs.",
                "blocking": true,
                "handler": "../taskHandlers/testHandler",
                "data": {
                  "delay": 500,
                  "error": false
                }
              }
            }
          },
          "headers": {
            "content-security-policy": "default-src 'none'",
            "x-xss-protection": "1; mode=block",
            "x-frame-options": "deny",
            "x-content-type-options": "nosniff",
            "strict-transport-security": "max-age=31536000",
            "etag": "\"e1fcf909fd53a8f6fa2e085835e59fba51f1344b\"",
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "max-age=300",
            "x-github-request-id": "17EB2F18:5094:7EDF2C9:564E55CB",
            "content-length": "692",
            "accept-ranges": "bytes",
            "date": "Thu, 19 Nov 2015 23:05:48 GMT",
            "via": "1.1 varnish",
            "connection": "close",
            "x-served-by": "cache-sjc3123-SJC",
            "x-cache": "MISS",
            "x-cache-hits": "0",
            "vary": "Authorization,Accept-Encoding",
            "access-control-allow-origin": "*",
            "x-fastly-request-id": "04ac282da1afb0e12aa3f6fe448450aabedf083a",
            "expires": "Thu, 19 Nov 2015 23:10:48 GMT",
            "source-age": "0"
          },
          "request": {
            "uri": {
              "protocol": "https:",
              "slashes": true,
              "auth": null,
              "host": "raw.githubusercontent.com",
              "port": 443,
              "hostname": "raw.githubusercontent.com",
              "hash": null,
              "search": null,
              "query": null,
              "pathname": "/cloudb2/processus/master/test/demo1.json",
              "path": "/cloudb2/processus/master/test/demo1.json",
              "href": "https://raw.githubusercontent.com/cloudb2/processus/master/test/demo1.json"
            },
            "method": "GET",
            "headers": {
              "accept": "application/json"
            }
          }
        },
        "body": {
          "tasks": {
            "task 1": {
              "description": "I am the task 1, I take 1500msecs.",
              "blocking": true,
              "handler": "../taskHandlers/testHandler",
              "data": {
                "delay": 1500,
                "error": false
              }
            },
            "task 2": {
              "description": "I am the task 2, I take 1000msecs.",
              "blocking": true,
              "handler": "../taskHandlers/testHandler",
              "data": {
                "delay": 1000,
                "error": false
              }
            },
            "task 3": {
              "description": "I am the task 3, I take 500msecs.",
              "blocking": true,
              "handler": "../taskHandlers/testHandler",
              "data": {
                "delay": 500,
                "error": false
              }
            }
          }
        }
      },
      "status": "completed",
      "timeOpened": 1447974347653,
      "timeStarted": 1447974347654,
      "timeCompleted": 1447974348486,
      "handlerDuration": 832,
      "totalDuration": 833
    }
  },
  "status": "completed",
  "id": "60946ca2-af30-4a78-babb-3b1d80a09ed2"
}
info: ✰ Workflow [test/demo12.json] with id [60946ca2-af30-4a78-babb-3b1d80a09ed2] completed successfully.
```

### workflowHandler

The workflowHandler allows a task to call another workflow. ```demo13.json``` shows an example of this.

```
{
  "tasks": {
    "call demo1 workflow": {
      "description": "calls the workflow in the file demo1",
      "blocking": true,
      "handler" : "../taskHandlers/workflowHandler",
      "data": {
        "file": "./test/demo1.json"
      }
    }
  }
}
```

Running this shows how workflows can be nested.

```
$ ./bin/processus-cli -l debug -f test/demo13.json

  ____  ____   __    ___  ____  ____  ____  _  _  ____
 (  _ \(  _ \ /  \  / __)(  __)/ ___)/ ___)/ )( \/ ___)
  ) __/ )   /(  O )( (__  ) _) \___  \___ \) \/ (\___ \
 (__)  (__\_) \__/  \___)(____)(____/(____/\____/(____/

           Processus: A Simple Workflow Engine.

info: reading workflow file [test/demo13.json]
...
[detail removed for simplicity]
...
debug: Workflow returned successfully.
debug: {
  "tasks": {
    "call demo1 workflow": {
      "description": "calls the workflow in the file demo1",
      "blocking": true,
      "handler": "../taskHandlers/workflowHandler",
      "data": {
        "file": "./test/demo1.json",
        "workflow": {
          "tasks": {
            "task 1": {
              "description": "I am the task 1, I take 1500msecs.",
              "blocking": true,
              "handler": "../taskHandlers/testHandler",
              "data": {
                "delay": 1500,
                "error": false
              },
              "status": "completed",
              "timeOpened": 1447974254582,
              "timeStarted": 1447974254582,
              "timeCompleted": 1447974256088,
              "handlerDuration": 1506,
              "totalDuration": 1506
            },
            "task 2": {
              "description": "I am the task 2, I take 1000msecs.",
              "blocking": true,
              "handler": "../taskHandlers/testHandler",
              "data": {
                "delay": 1000,
                "error": false
              },
              "status": "completed",
              "timeOpened": 1447974256090,
              "timeStarted": 1447974256091,
              "timeCompleted": 1447974257093,
              "handlerDuration": 1002,
              "totalDuration": 1003
            },
            "task 3": {
              "description": "I am the task 3, I take 500msecs.",
              "blocking": true,
              "handler": "../taskHandlers/testHandler",
              "data": {
                "delay": 500,
                "error": false
              },
              "status": "completed",
              "timeOpened": 1447974257095,
              "timeStarted": 1447974257096,
              "timeCompleted": 1447974257602,
              "handlerDuration": 506,
              "totalDuration": 507
            }
          },
          "status": "completed",
          "id": "c29d5d5b-beeb-45d5-abe9-c8d15ea6bf0e"
        }
      },
      "status": "completed",
      "timeOpened": 1447974254576,
      "timeStarted": 1447974254577,
      "timeCompleted": 1447974257605,
      "handlerDuration": 3028,
      "totalDuration": 3029
    }
  },
  "status": "completed",
  "id": "e9898256-b00d-47ca-bcea-2ed314296e89"
}
info: ✰ Workflow [test/demo13.json] with id [e9898256-b00d-47ca-bcea-2ed314296e89] completed successfully.
```

***Note***

1.  the parent workflow contains one task ```call demo1 workflow``` which contains the ```data.workflow``` property which contains the resulting ```demo1.json``` workflow.

### Environment Variables

It's possible to 'inject' environment variables into your workflow.

Consider ```demo14.json```
```
{
  "tasks": {
    "show env": {
      "blocking": true,
      "handler" : "../taskHandlers/logHandler",
      "data": {
        "level": "info",
        "log": "TEST_ENV = $env[TEST_ENV]"
      }
    }
  }
}
```
***Note***

1. Note that we're using a new handler called ```logHandler``` which, as the name suggests, logs the output supplied.
2. Similar to data referencing, Processus uses the ```$env[<ENVIRONMENT NAME>]``` as a marker for environment variables.

looking at the example ```.env``` file used by Processus, we see the following.
```
# persistence env vars
DATA_DIR="_data"
DB_TYPE="file"

# test env vars
TEST_TASKS_BLOCKING="true"
TEST_ENV="HELLO, WORLD"
```

Therefore we can conclude that the output of the ```demo14.json``` would be ```TEST_ENV = HELLO, WORLD```

Let's try it
```
$ ./bin/processus-cli -l info -f test/demo14.json

  ____  ____   __    ___  ____  ____  ____  _  _  ____
 (  _ \(  _ \ /  \  / __)(  __)/ ___)/ ___)/ )( \/ ___)
  ) __/ )   /(  O )( (__  ) _) \___  \___ \) \/ (\___ \
 (__)  (__\_) \__/  \___)(____)(____/(____/\____/(____/

           Processus: A Simple Workflow Engine.

info: reading workflow file [test/demo14.json]
info: ⧖ Starting task [show env]
info: TEST_ENV = HELLO, WORLD
info: ✰ Workflow [test/demo14.json] with id [f8442a63-dffd-4247-9eb7-44fac3a4df34] completed successfully.
```
