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
* [Contributing](#contributing)
  * [Contributing - Roadmap](#contributing---roadmap)

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

2015-11-19 00:23:07 INFO reading workflow file ./test/demo1.json
2015-11-19 00:23:08 INFO ⧖ Staring task task 1
2015-11-19 00:23:09 INFO ✔ task task 1 completed successfully.
2015-11-19 00:23:09 INFO ⧖ Staring task task 2
2015-11-19 00:23:10 INFO ✔ task task 2 completed successfully.
2015-11-19 00:23:10 INFO ⧖ Staring task task 3
2015-11-19 00:23:11 INFO ✔ task task 3 completed successfully.
2015-11-19 00:23:11 INFO ✰ Workflow [./test/demo1.json] with id [92760c03-98fb-4ebe-baf4-bae5b65939c6] completed successfully.
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

2015-11-19 00:24:50 INFO reading workflow file ./test/demo2.json
2015-11-19 00:24:50 INFO ⧖ Staring task task 1
2015-11-19 00:24:50 INFO ⧖ Staring task task 2
2015-11-19 00:24:50 INFO ⧖ Staring task task 3
2015-11-19 00:24:51 INFO ✔ task task 3 completed successfully.
2015-11-19 00:24:51 INFO ✔ task task 2 completed successfully.
2015-11-19 00:24:52 INFO ✔ task task 1 completed successfully.
2015-11-19 00:24:52 INFO ✰ Workflow [./test/demo2.json] with id [e7eee333-2c24-4c60-901c-0ed0b8e57d54] completed successfully.
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

2015-11-19 00:49:31 INFO reading workflow file ./test/demo3.json
2015-11-19 00:49:31 INFO ⧖ Staring task task 1
2015-11-19 00:49:32 INFO ✔ task task 1 completed successfully.
2015-11-19 00:49:33 INFO ⧖ Staring task task 2-1
2015-11-19 00:49:34 INFO ✔ task task 2-1 completed successfully.
2015-11-19 00:49:34 INFO ⧖ Staring task task 2-2
2015-11-19 00:49:35 INFO ✔ task task 2-2 completed successfully.
2015-11-19 00:49:35 INFO ⧖ Staring task task 2
2015-11-19 00:49:36 INFO ✔ task task 2 completed successfully.
2015-11-19 00:49:36 INFO ⧖ Staring task task 3
2015-11-19 00:49:36 INFO ✔ task task 3 completed successfully.
2015-11-19 00:49:36 INFO ✰ Workflow [./test/demo3.json] with id [2966f6d0-f06f-4c51-9123-65591e31de1d] completed successfully.
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
...
[output removed for clarity]
...
2015-11-19 00:30:11 DEBUG Workflow returned successfully.
2015-11-19 00:30:12 DEBUG {
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
      "timeOpened": 1447893007451,
      "timeStarted": 1447893007452,
      "timeCompleted": 1447893008960,
      "handlerDuration": 1508,
      "totalDuration": 1509
    },
    "task 2": {
      "description": "I am the task 2, I take as long as task1.",
      "blocking": true,
      "handler": "../taskHandlers/testHandler",
      "data": {
        "delay": "1500", <---[updated value]
        "error": false
      },
      "status": "completed",
      "timeOpened": 1447893008963,
      "timeStarted": 1447893008966,
      "timeCompleted": 1447893010482,
      "handlerDuration": 1516,
      "totalDuration": 1519
    },
    "task 3": {
      "description": "I am the task 3, I take as long as task1.",
      "blocking": true,
      "handler": "../taskHandlers/testHandler",
      "data": {
        "delay": "1500", <---[updated value]
        "error": false
      },
      "status": "completed",
      "timeOpened": 1447893010484,
      "timeStarted": 1447893010485,
      "timeCompleted": 1447893011997,
      "handlerDuration": 1512,
      "totalDuration": 1513
    }
  },
  "status": "completed",
  "id": "6757ac60-3de9-4fc3-922b-6a3e34686f03"
}
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

...
[output removed for clarity]
...

2015-11-19 00:39:21 ERROR ✘ This is an error from the task task 2
2015-11-19 00:39:21 ERROR ✘ Workflow [./test/demo8.json] with id [faacf120-51df-4e33-8c89-74cfa5c2f9e9] exited with error!
2015-11-19 00:39:21 DEBUG {
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
      "timeOpened": 1447893558565,
      "timeStarted": 1447893558567,
      "timeCompleted": 1447893560071,
      "handlerDuration": 1504,
      "totalDuration": 1506
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
      "timeOpened": 1447893560074,
      "timeStarted": 1447893560075,
      "errorMsg": "This is an error from the task task 2"
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
  "id": "faacf120-51df-4e33-8c89-74cfa5c2f9e9"
}
```
***Note***
1. Task 2 is in the ```error``` state and Processus has added the ```errorMsg``` property
2. The workflow is also in the ```error``` state.
3. Task 3 is in the ```waiting``` state.

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

2015-11-19 00:55:58 INFO reading workflow file ./test/demo8a.json
2015-11-19 00:55:58 INFO ⧖ Staring task task 1
2015-11-19 00:56:00 INFO ✔ task task 1 completed successfully.
2015-11-19 00:56:00 INFO ⧖ Staring task task 2
2015-11-19 00:56:01 INFO ✔ task task 2 completed successfully.
2015-11-19 00:56:01 INFO ignoring error, as request for task task 2
2015-11-19 00:56:01 INFO ⧖ Staring task task 3
2015-11-19 00:56:02 INFO ✔ task task 3 completed successfully.
2015-11-19 00:56:02 INFO ✰ Workflow [./test/demo8a.json] with id [9062e489-ae9e-49b5-b72c-0dcfd2ba7eb7] completed successfully.

```

### Task Conditions - skipIf and errorIf

Tasks can have the extra properties ```skipIf``` and ```errorIf```.

As the names suggest, if either property evaluates to true, then Processus will either skip the task and just mark it as completed or raise an error and stop.

As with sharing data values, you can reference another part of the workflow and have that substituted at execution time. Processus will evaluate the string condition and set property appropriately. Any string with the value ```true``` regardless of case, will evaluate to true. Any other string will evaluate to ```false```.

Look at demo10 to see an example of ```skipIf``` and ```errorIf``` in action.
