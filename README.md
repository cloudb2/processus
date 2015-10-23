# Processus

Processus is a simple lightweight workflow engine designed to help orchestrate
multiple tasks. There are many workflow engines already, but Processus makes some
very specific assumptions that make it easy to quickly write simple, yet powerful
workflows.

[Getting Started](#getting-started)
  * [Installation](#installation)
  * [Intoduction](#introduction)

[Processus Engine In Detail](#processus-engine-in-detail)
  * [Tasks - Sequential Tasks](#tasks---sequential-tasks)
  * [Tasks - Parallel Tasks](#tasks---parallel-tasks)
  * [Tasks - Nested Tasks (Sequential)](#tasks---nested-tasks-sequential)
  * [Tasks - Nested Tasks (Parallel)](#tasks---nested-tasks-parallel)
  * [Tasks - Mixing Sequential and Parallel tasks](#tasks---mixing-sequential-and-parallel-tasks)
  * [Tasks - Passing Data from Task to Task](#tasks---passing-data-from-task-to-task)
  * [Workflow - Passing Static Data to Tasks](#workflow---passing-static-data-to-tasks)
  * [Workflow - Handling Errors](#workflow---handling-errors)
  * [Task Handlers - The Interface](#task-handlers---the-interface)
  * [Task Handlers - Shell Handler](#task-handlers---shell-handler)
  * [Task Handlers - Shell Demo](#task-handlers---shell-demo)
  * [Tasks - Conditions Skip_if and Error_if](#tasks---conditions-skip_if-and-error_if)

[Contributing](#contributing)
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


A workflow in Processus is defined using JSON, which should conform to a specific
schema. The best way to understand that schema is looking at examples.

## Introduction

Processus assumes that the person assembling the workflow is NOT necessarily familiar with the nuances of software development. Although they use JSON to configure the workflow, its executional flow and conditional constructs, they will defer the difficult task of interacting with various endpoints and systems to the task handlers. In short, Processus tries to employ a KIS (Keep It Simple) philosophy to its configuration.

Let's suppose we want 3 tasks in series.
Look at the JSON file ```./test/demo1.json```

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

This JSON file will execute the tasks sequentially. i.e.
```task 1``` -> ```task 2``` -> ```task 3```

Before we run this file in Processus, let's take a quick look at the Task object.
```
"task 1": {
  "description": "I am the task 1, I take 1500msecs.",
  "blocking": true,
  "handler" : "../taskHandlers/testHandler",
  "data": {
    "delay": 1500,
    "error": false
  }
}
```
Note the following:

1. **The Task Name**: The task name can contain spaces, but obviously each name must be unique or it's
not valid JSON. In this case the name of the first task is ```task 1```
2. **description**: A simple string containing a description of the task
3. **blocking**: A boolean value telling Processus if you wish to block during the execution of this task
or not. If you block for each task, they will all run sequentially. If you set this to false they
will run in parallel (more on this later).
4. **handler**: Is a string specifying the module name to handle the task. Processus comes with an
example task handler called ```testHandler```, which simply outputs the task details.
5. **data**: The data object contains information used by the task handler. In this case
the handler ```testHandler``` uses the data parameters ```delay``` (how long the task is delayed) and
```error``` whether the task should raise an error when it finishes. More on data objects later.
6. Procesus will run the tasks in the order they're defined within the parent workflow object, unless blocking is set to false.

Ok, now we have the simplest definition of a task, let's run the file demo1.json

first run the following to see the cli options. It's assumed you're executing Processus in the directory in which it was installed.
```
$ ./bin/processus-cli -h
```

You should see something similar to the following.
```

  ____  ____   __    ___  ____  ____  ____  _  _  ____
 (  _ \(  _ \ /  \  / __)(  __)/ ___)/ ___)/ )( \/ ___)
  ) __/ )   /(  O )( (__  ) _) \___  \___ \) \/ (\___ \
 (__)  (__\_) \__/  \___)(____)(____/(____/\____/(____/

           Processus: A Simple Workflow Engine.

Usage:
  processus-cli [OPTIONS] [ARGS]

Options:
  -l, --loglevel [STRING]Set loglevel [debug|verbose|info|warn|error] (Default is error)
  -f, --file [FILE]      Workflow filename (Default is workflow.json)
  -h, --help             Display help and usage details

```

**Notice** that Processus defaults to the error log level, so you won't see any output other than errors. For the purposes of the demo, let's change the loglevel to ```info``` and specify the filename ```./test/demo1.json```

```
$ ./bin/processus-cli -l info -f ./test/demo1.json
```

The output should look something like this.
```
...

2015-10-12 23:24:16 INFO testHandler:
 executing task 1
2015-10-12 23:24:16 INFO Task Description:
 I am the task 1, I take 1500msecs.
2015-10-12 23:24:18 INFO testHandler:
 completed task 1
2015-10-12 23:24:18 INFO testHandler:
 executing task 2
2015-10-12 23:24:18 INFO Task Description:
 I am the task 2, I take 1000msecs.
2015-10-12 23:24:19 INFO testHandler:
 completed task 2
2015-10-12 23:24:19 INFO testHandler:
 executing task 3
2015-10-12 23:24:19 INFO Task Description:
 I am the task 3, I take 500msecs.
2015-10-12 23:24:19 INFO testHandler:
 completed task 3
2015-10-12 23:24:19 INFO Workflow returned successfully.
```

That's it, you executed your first workflow using Processus!

In this case, it didn't do a lot, except simulate 3 tasks, running sequentially,
and each delayed half a second less than the previous task.

Let's look a little closer at the workflow and tasks that returned from Processus.

Execute the same command again, this time setting the loglevel to ```debug```

```
$ ./bin/processus-cli -l debug -f ./test/demo1.json
```

The output should look something like this.
```
...

2015-10-12 22:57:37 INFO Workflow returned successfully.
2015-10-12 22:57:37 DEBUG {
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
      "time-opened": 1444690654882,
      "time-started": 1444690654883,
      "time-completed": 1444690655396,
      "handler-duration": 513,
      "total-duration": 514
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
      "time-opened": 1444690655396,
      "time-started": 1444690655396,
      "time-completed": 1444690656403,
      "handler-duration": 1007,
      "total-duration": 1007
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
      "time-opened": 1444690656404,
      "time-started": 1444690656404,
      "time-completed": 1444690657908,
      "handler-duration": 1504,
      "total-duration": 1504
    }
  },
  "status": "completed"
}
```

**Notice** that the Processus engine has added additional information to each task and the parent workflow objects.

This includes the following:

1. **status** A status for each task and the overall workflow
2. **time-opened** The time (milliseconds elapsed since 1 January 1970 00:00:00 UTC up until now) the task was opened.
3. **time-started** The time the task was started. Later we'll explore why this can be different to time-opened
4. **time-completed** The time the task completed
5. **handler-duration** The time it took the handler to execute the task
6. **total-duration** The total duration the task was opened. Later we'll explore why this can be different to handler-duration
[top](#processus)

<hr>
# Processus Engine In Detail

## Tasks - Sequential Tasks

```
(start)----[task 1]-----[task 2]-----[task 3]----(end)
```

The JSON config file (demo1)
<pre><code>
{
  "tasks":{
    "task 1": {
      "description": "I am the task 1, I take 1500msecs.",
      "blocking": <b>true</b>,
      "handler" : "../taskHandlers/testHandler",
      "data": {
        "delay": 1500,
        "error": false
      }
    },
    "task 2": {
      "description": "I am the task 2, I take 1000msecs.",
      "blocking": <b>true</b>,
      "handler" : "../taskHandlers/testHandler",
      "data": {
        "delay": 1000,
        "error": false
      }
    },
    "task 3": {
      "description": "I am the task 3, I take 500msecs.",
      "blocking": <b>true</b>,
      "handler" : "../taskHandlers/testHandler",
      "data": {
        "delay": 500,
        "error": false
      }
    }
  }
}
</code></pre>

Running the demo
```
$ ./bin/processus-cli -l info -f ./test/demo1.json

  ____  ____   __    ___  ____  ____  ____  _  _  ____
 (  _ \(  _ \ /  \  / __)(  __)/ ___)/ ___)/ )( \/ ___)
  ) __/ )   /(  O )( (__  ) _) \___  \___ \) \/ (\___ \
 (__)  (__\_) \__/  \___)(____)(____/(____/\____/(____/

           Processus: A Simple Workflow Engine.

2015-10-12 23:24:16 INFO testHandler:
 executing task 1
2015-10-12 23:24:16 INFO Task Description:
 I am the task 1, I take 1500msecs.
2015-10-12 23:24:18 INFO testHandler:
 completed task 1
2015-10-12 23:24:18 INFO testHandler:
 executing task 2
2015-10-12 23:24:18 INFO Task Description:
 I am the task 2, I take 1000msecs.
2015-10-12 23:24:19 INFO testHandler:
 completed task 2
2015-10-12 23:24:19 INFO testHandler:
 executing task 3
2015-10-12 23:24:19 INFO Task Description:
 I am the task 3, I take 500msecs.
2015-10-12 23:24:19 INFO testHandler:
 completed task 3
2015-10-12 23:24:19 INFO Workflow returned successfully.
```

[top](#processus)


## Tasks - Parallel Tasks
```
(start)-+--[task 1]--+-(end)
        |--[task 2]--|
        +--[task 3]--+
```

The JSON config file (demo2)
<pre><code>
{
  "tasks":{
    "task 1": {
      "description": "I am the task 1, I take 1500msecs.",
      "blocking": <b>false</b>,
      "handler" : "../taskHandlers/testHandler",
      "data": {
        "delay": 1500,
        "error": false
      }
    },
    "task 2": {
      "description": "I am the task 2, I take 1000msecs.",
      "blocking": <b>false</b>,
      "handler" : "../taskHandlers/testHandler",
      "data": {
        "delay": 1000,
        "error": false
      }
    },
    "task 3": {
      "description": "I am the task 3, I take 500msecs.",
      "blocking": <b>false</b>,
      "handler" : "../taskHandlers/testHandler",
      "data": {
        "delay": 500,
        "error": false
      }
    }
  }
}
</code></pre>
**Notice** blocking is set to ```false``` for each task, causing them all to run in
parallel.

Running the demo
<pre><code>
$ ./bin/processus-cli -l info -f ./test/demo2.json

  ____  ____   __    ___  ____  ____  ____  _  _  ____
 (  _ \(  _ \ /  \  / __)(  __)/ ___)/ ___)/ )( \/ ___)
  ) __/ )   /(  O )( (__  ) _) \___  \___ \) \/ (\___ \
 (__)  (__\_) \__/  \___)(____)(____/(____/\____/(____/

           Processus: A Simple Workflow Engine.

2015-10-12 23:26:32 INFO testHandler:
 executing task 1
2015-10-12 23:26:32 INFO Task Description:
 I am the task 1, I take 1500msecs.
2015-10-12 23:26:32 INFO testHandler:
 executing task 2
2015-10-12 23:26:32 INFO Task Description:
 I am the task 2, I take 1000msecs.
2015-10-12 23:26:32 INFO testHandler:
 executing task 3
2015-10-12 23:26:32 INFO Task Description:
 I am the task 3, I take 500msecs.
2015-10-12 23:26:33 INFO testHandler:
 <b>completed task 3</b>
2015-10-12 23:26:33 INFO testHandler:
 <b>completed task 2</b>
2015-10-12 23:26:34 INFO testHandler:
 <b>completed task 1</b>
2015-10-12 23:26:34 INFO Workflow returned successfully.
</code></pre>
**Notice** the tasks completed in reverse order (due to the time delays), but overall
the workflow completed quicker than the previous demo.

[top](#processus)


## Tasks - Nested Tasks (Sequential)
```
(start)----[task 1]-----[          task 2          ]-----[task 3]----(end)
                        |                          |
                        ()-[task 2-1]--[task 2-2]-()
```
The JSON config file (demo3)
<pre><code>
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
      <b>"tasks"</b>: {
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
</code></pre>

**Notice** that ```task 2``` contains ```tasks``` itself.
Processus allows nesting of tasks and does not limit the level of nesting. This is
a powerful feature, but it does make some assumptions:

1. The parent task opens directly after it's previous sibling
2. The parent task CANNOT complete until ALL the child tasks have completed
3. The parent task is therefore not executed until ALL of the children have completed
4. Setting the parent's blocking property to false will NOT prevent it being delayed until
the child tasks have completed. However, that will cause it to open in parallel with its
siblings.

Incidentally this is why a task's ```time-opened``` time may differ from the ```time-started``` time. It's also why the ```total-duration``` may be different from the ```handler-duration```.

Running the demo
<pre><code>
$ ./bin/processus-cli -l info -f ./test/demo3.json

  ____  ____   __    ___  ____  ____  ____  _  _  ____
 (  _ \(  _ \ /  \  / __)(  __)/ ___)/ ___)/ )( \/ ___)
  ) __/ )   /(  O )( (__  ) _) \___  \___ \) \/ (\___ \
 (__)  (__\_) \__/  \___)(____)(____/(____/\____/(____/

           Processus: A Simple Workflow Engine.

2015-10-12 23:35:32 INFO testHandler:
 executing task 1
2015-10-12 23:35:32 INFO Task Description:
 I am the task 1, I take 1500msecs.
2015-10-12 23:35:33 INFO testHandler:
 completed task 1
2015-10-12 23:35:33 INFO testHandler:
 executing task 2-1
2015-10-12 23:35:33 INFO Task Description:
 I am the task 2-1, I take 1000msecs.
2015-10-12 23:35:34 INFO testHandler:
 <b>completed task 2-1</b>
2015-10-12 23:35:34 INFO testHandler:
 executing task 2-2
2015-10-12 23:35:34 INFO Task Description:
 I am the task 2-2, I take 1000msecs.
2015-10-12 23:35:35 INFO testHandler:
 <b>completed task 2-2</b>
2015-10-12 23:35:35 INFO testHandler:
 executing task 2
2015-10-12 23:35:35 INFO Task Description:
 I am the task 2, I take 1000msecs.
2015-10-12 23:35:36 INFO testHandler:
 <b>completed task 2</b>
2015-10-12 23:35:36 INFO testHandler:
 executing task 3
2015-10-12 23:35:36 INFO Task Description:
 I am the task 3, I take 500msecs.
2015-10-12 23:35:37 INFO testHandler:
 completed task 3
2015-10-12 23:35:37 INFO Workflow returned successfully.
</code></pre>

**Notice** that task ```task 2-1``` and ```task 2-2``` are completed before the parent
task ```task 2``` is executed.

To understand this further, execute the same demo again, but this time with the loglevel set to ```debug``` and then take a look at the workflow object returned.
<pre><code>
$ ./bin/processus-cli -l debug -f ./test/demo3.json

...
...

2015-10-13 00:18:47 INFO Workflow returned successfully.
2015-10-13 00:18:47 DEBUG {
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
      "time-opened": 1444695522056,
      "time-started": 1444695522057,
      "time-completed": 1444695523566,
      "handler-duration": 1509,
      "total-duration": 1510
    },
    "task 2": {
      "description": "I am the task 2, I take 1000msecs.",
      "blocking": true,
      "handler": "../taskHandlers/testHandler",
      "data": {
        "delay": 1000,
        "error": false
      },
      "tasks": {
        "task 2-1": {
          "description": "I am the task 2-1, I take 1000msecs.",
          "blocking": true,
          "handler": "../taskHandlers/testHandler",
          "data": {
            "delay": 1000,
            "error": false
          },
          "status": "completed",
          "time-opened": 1444695523566,
          "time-started": 1444695523567,
          "time-completed": 1444695524570,
          "handler-duration": 1003,
          "total-duration": 1004
        },
        "task 2-2": {
          "description": "I am the task 2-2, I take 1000msecs.",
          "blocking": true,
          "handler": "../taskHandlers/testHandler",
          "data": {
            "delay": 1000,
            "error": false
          },
          "status": "completed",
          "time-opened": 1444695524571,
          "time-started": 1444695524571,
          "time-completed": 1444695525577,
          "handler-duration": 1006,
          "total-duration": 1006
        }
      },
      "status": "completed",
      <b>"time-opened": 1444695523566,
      "time-started": 1444695525577,
      "time-completed": 1444695526586,
      "handler-duration": 1009,
      "total-duration": 3020</b>
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
      "time-opened": 1444695526587,
      "time-started": 1444695526587,
      "time-completed": 1444695527091,
      "handler-duration": 504,
      "total-duration": 504
    }
  },
  "status": "completed"
}
</code></pre>
**Notice** that the times for task 2 reflect the assumptions made by the Processus engine.

1. The task opened immediately, but was not executed i.e. ```time-opened```
2. The task started once its child tasks had completed successfully i.e. ```time-started```
3. The ```handler-duration``` i.e. the time to execute the task was ~1 sec (as configured), but overall it was open for ```total-duration``` ~3 secs (i.e. a sec for each child and a sec for itself).

[top](#processus)


## Tasks - Nested Tasks (Parallel)
```
(start)-+--[task 1]-------------------+----(end)
        |                             |
        |--[          task 2       ]--|
        |  |                          |
        |  ()-[task 2-1]--[task 2-2]-()
        |                             |
        +--[task 3]-------------------+

```
The JSON config file (demo4)
<pre><code>
{
  "tasks":{
    "task 1": {
      "description": "I am the task 1, I take 1500msecs.",
      "blocking": <b>false</b>,
      "handler" : "../taskHandlers/testHandler",
      "data": {
        "delay": 1500,
        "error": false
      }
    },
    "task 2": {
      "description": "I am the task 2, I take 1000msecs.",
      "blocking": <b>false</b>,
      "handler" : "../taskHandlers/testHandler",
      "data": {
        "delay": 1000,
        "error": false
      },
      "tasks": {
        "task 2-1": {
          "description": "I am the task 2-1, I take 1000msecs.",
          "blocking": <b>false</b>,
          "handler" : "../taskHandlers/testHandler",
          "data": {
            "delay": 1000,
            "error": false
          }
        },
        "task 2-2": {
          "description": "I am the task 2-2, I take 1000msecs.",
          "blocking": <b>false</b>,
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
      "blocking": <b>false</b>,
      "handler" : "../taskHandlers/testHandler",
      "data": {
        "delay": 500,
        "error": false
      }
    }
  }
}

</code></pre>

**Notice** that ```task 2``` contains ```tasks``` itself.

Running the demo
<pre><code>
$ ./bin/processus-cli -l info -f ./test/demo4.json

  ____  ____   __    ___  ____  ____  ____  _  _  ____
 (  _ \(  _ \ /  \  / __)(  __)/ ___)/ ___)/ )( \/ ___)
  ) __/ )   /(  O )( (__  ) _) \___  \___ \) \/ (\___ \
 (__)  (__\_) \__/  \___)(____)(____/(____/\____/(____/

           Processus: A Simple Workflow Engine.

2015-10-13 00:03:04 INFO testHandler:
 executing task 1
2015-10-13 00:03:04 INFO Task Description:
 I am the task 1, I take 1500msecs.
2015-10-13 00:03:04 INFO testHandler:
 executing task 2-1
2015-10-13 00:03:04 INFO Task Description:
 I am the task 2-1, I take 1000msecs.
2015-10-13 00:03:04 INFO testHandler:
 executing task 2-2
2015-10-13 00:03:04 INFO Task Description:
 I am the task 2-2, I take 1000msecs.
2015-10-13 00:03:04 INFO testHandler:
 executing task 3
2015-10-13 00:03:04 INFO Task Description:
 I am the task 3, I take 500msecs.
2015-10-13 00:03:04 INFO testHandler:
 completed task 3
2015-10-13 00:03:05 INFO testHandler:
 <b>completed task 2-1</b>
2015-10-13 00:03:05 INFO testHandler:
 <b>completed task 2-2</b>
2015-10-13 00:03:05 INFO testHandler:
 completed task 1
2015-10-13 00:03:05 INFO testHandler:
 <b>executing task 2</b>
2015-10-13 00:03:05 INFO Task Description:
 I am the task 2, I take 1000msecs.
2015-10-13 00:03:06 INFO testHandler:
 completed task 2
2015-10-13 00:03:06 INFO Workflow returned successfully.
</code></pre>

**Notice** that, once again, task ```task 2-1``` and ```task 2-2``` are completed before the parent
task ```task 2``` is executed. However, Processus evaluated the entire workflow
and decided that it can run task 1, task2-1, task2-2, and task 3 ALL in parallel.

[top](#processus)


## Tasks - Mixing Sequential and Parallel Tasks

```
(start)-+--[task 1]--+--[task 3]--(end)
        +--[task 2]--+
```

The JSON config file (demo5)
<pre><code>
{
  "tasks":{
    "task 1": {
      "description": "I am the task 1, I take 1500msecs.",
      <b>"blocking": false,</b>
      "handler" : "../taskHandlers/testHandler",
      "data": {
        "delay": 1500,
        "error": false
      }
    },
    "task 2": {
      "description": "I am the task 2, I take 1000msecs.",
      <b>"blocking": true,</b>
      "handler" : "../taskHandlers/testHandler",
      "data": {
        "delay": 1000,
        "error": false
      }
    },
    "task 3": {
      "description": "I am the task 3, I take 500msecs.",
      <b>"blocking": true,</b>
      "handler" : "../taskHandlers/testHandler",
      "data": {
        "delay": 500,
        "error": false
      }
    }
  }
}
</code></pre>

**Notice** Processus follows the order the tasks are defined, but if a task's blocking property is set to false, it will continue and execute the next task(s) until it reaches a task with a blocking property set to true (or the end). In this case, tasks ```task 1``` and ```task 2``` run in parallel but ```task 3``` is forced to wait for ```task 2``` as its blocking property is set to true.

Running the demo
<pre><code>
$ ./bin/processus-cli -l info -f ./test/demo5.json

  ____  ____   __    ___  ____  ____  ____  _  _  ____
 (  _ \(  _ \ /  \  / __)(  __)/ ___)/ ___)/ )( \/ ___)
  ) __/ )   /(  O )( (__  ) _) \___  \___ \) \/ (\___ \
 (__)  (__\_) \__/  \___)(____)(____/(____/\____/(____/

           Processus: A Simple Workflow Engine.

2015-10-13 02:01:47 INFO testHandler:
 executing task 1
2015-10-13 02:01:47 INFO Task Description:
 I am the task 1, I take 1500msecs.
2015-10-13 02:01:47 INFO testHandler:
 executing task 2
2015-10-13 02:01:47 INFO Task Description:
 I am the task 2, I take 1000msecs.
2015-10-13 02:01:48 INFO testHandler:
 <b>completed task 2</b>
2015-10-13 02:01:48 INFO testHandler:
 <b>completed task 1</b>
2015-10-13 02:01:48 INFO testHandler:
 executing task 3
2015-10-13 02:01:48 INFO Task Description:
 I am the task 3, I take 500msecs.
2015-10-13 02:01:49 INFO testHandler:
 completed task 3
2015-10-13 02:01:49 INFO Workflow returned successfully.
</code></pre>

**Notice** task 3 is forced to wait for tasks 1 and 2 (running in parallel).

[top](#processus)


## Tasks - Passing Data from Task to Task

Processus supports a very simple mechanism for referencing data between tasks.

The format is ```$[<path.to.reference>]```

For example, if a task has a data value of ```$[tasks.task 1.data.delay]``` this value
will be substituted at execution time with the value stored in the ```delay``` data property of ```task 1```.

Let's try it out.

The JSON config file (demo6)
<pre><code>
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
        <b>"delay": "$[tasks.task 1.data.delay]",</b>
        "error": false
      }
    },
    "task 3": {
      "description": "I am the task 3, I take as long as task1.",
      "blocking": true,
      "handler" : "../taskHandlers/testHandler",
      "data": {
        <b>"delay": "$[tasks.task 1.data.delay]",</b>
        "error": false
      }
    }
  }
}
</code></pre>

**Notice** the data delay value for tasks 2 and 3. As with the example above, these values
will be substituted with the value of ```task 1.data.delay``` in this case that's ```1500```
Meaning each task will now be delayed 1.5seconds.

Running the demo
<pre><code>
$ ./bin/processus-cli -l debug -f ./test/demo6.json

...
...

2015-10-13 18:38:38 INFO Workflow returned successfully.
2015-10-13 18:38:38 DEBUG {
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
      "time-opened": 1444761514349,
      "time-started": 1444761514350,
      "time-completed": 1444761515857,
      "handler-duration": 1507,
      "total-duration": 1508
    },
    "task 2": {
      "description": "I am the task 2, I take as long as task1.",
      "blocking": true,
      "handler": "../taskHandlers/testHandler",
      "data": {
        <b>"delay": "1500"</b>,
        "error": false
      },
      "status": "completed",
      "time-opened": 1444761515857,
      "time-started": 1444761515859,
      "time-completed": 1444761517370,
      "handler-duration": 1511,
      "total-duration": 1513
    },
    "task 3": {
      "description": "I am the task 3, I take as long as task1.",
      "blocking": true,
      "handler": "../taskHandlers/testHandler",
      "data": {
        <b>"delay": "1500"</b>,
        "error": false
      },
      "status": "completed",
      "time-opened": 1444761517371,
      "time-started": 1444761517372,
      "time-completed": 1444761518879,
      "handler-duration": 1507,
      "total-duration": 1508
    }
  },
  "status": "completed"
}
</code></pre>

**Notice** that the resulting workflow object now has the referenced value for tasks 2 and 3.
This demo was simple, but later we'll see how Task Handler's can return data values
and as such affect the operation of subsequent tasks that may reference that output data.

[top](#processus)


## Workflow - Passing Static Data to Tasks

The parent Workflow object can also contain data, that can be referenced by tasks.

The JSON config file (demo7)
<pre><code>
{
  <b>"static":{
    "global-delay":500,
    "global-error":false
  },</b>
  "tasks":{
    "task 1": {
      "description": "I am the task 1, I take global-delay msecs, which is 500msecs.",
      "blocking": true,
      "handler" : "../taskHandlers/testHandler",
      "data": {
        <b>"delay": "$[static.global-delay]",
        "error": "$[static.global-error]"</b>
      }
    },
    "task 2": {
      "description": "I am the task 2, I take global-delay msecs, which is 500msecs.",
      "blocking": true,
      "handler" : "../taskHandlers/testHandler",
      "data": {
        <b>"delay": "$[static.global-delay]",
        "error": "$[static.global-error]"</b>
      }
    },
    "task 3": {
      "description": "I am the task 3, I take global-delay msecs, which is 500msecs.",
      "blocking": true,
      "handler" : "../taskHandlers/testHandler",
      "data": {
        <b>"delay": "$[static.global-delay]",
        "error": "$[static.global-error]"</b>
      }
    }
  }
}
</code></pre>

Running the demo
<pre><code>
$ ./bin/processus-cli -l debug -f ./test/demo7.json

...
...

2015-10-13 18:43:47 INFO Workflow returned successfully.
2015-10-13 18:43:47 DEBUG {
  <b>"static": {
    "global-delay": 500,
    "global-error": false
  },</b>
  "tasks": {
    "task 1": {
      "description": "I am the task 1, I take global-delay msecs, which is 500msecs.",
      "blocking": true,
      "handler": "../taskHandlers/testHandler",
      "data": {
        <b>"delay": "500",
        "error": "false"</b>
      },
      "status": "completed",
      "time-opened": 1444761826343,
      "time-started": 1444761826349,
      "time-completed": 1444761826857,
      "handler-duration": 508,
      "total-duration": 514
    },
    "task 2": {
      "description": "I am the task 2, I take global-delay msecs, which is 500msecs.",
      "blocking": true,
      "handler": "../taskHandlers/testHandler",
      "data": {
        <b>"delay": "500",
        "error": "false"</b>
      },
      "status": "completed",
      "time-opened": 1444761826857,
      "time-started": 1444761826859,
      "time-completed": 1444761827371,
      "handler-duration": 512,
      "total-duration": 514
    },
    "task 3": {
      "description": "I am the task 3, I take global-delay msecs, which is 500msecs.",
      "blocking": true,
      "handler": "../taskHandlers/testHandler",
      "data": {
        <b>"delay": "500",
        "error": "false"</b>
      },
      "status": "completed",
      "time-opened": 1444761827372,
      "time-started": 1444761827374,
      "time-completed": 1444761827886,
      "handler-duration": 512,
      "total-duration": 514
    }
  },
  "status": "completed"
}
</code></pre>

**Notice** that all tasks have the same values as the static element in the parent workflow object.

[top](#processus)

## Workflow - Handling Errors

When a task returns an error Processus stops the overall workflow and sets its status to ```error```

The JSON config file (demo8)
<pre><code>
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
        <b>"error": true</b>
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
</code></pre>
**Notice** that task 2 is set to raise an error from the test handler.

Running the demo
<pre><code>
$ ./bin/processus-cli -l info -f ./test/demo8.json

  ____  ____   __    ___  ____  ____  ____  _  _  ____
 (  _ \(  _ \ /  \  / __)(  __)/ ___)/ ___)/ )( \/ ___)
  ) __/ )   /(  O )( (__  ) _) \___  \___ \) \/ (\___ \
 (__)  (__\_) \__/  \___)(____)(____/(____/\____/(____/

           Processus: A Simple Workflow Engine.

2015-10-14 00:29:51 INFO testHandler:
 executing task 1
2015-10-14 00:29:51 INFO Task Description:
 I am the task 1, I take 1500msecs.
2015-10-14 00:29:52 INFO testHandler:
 completed task 1
2015-10-14 00:29:52 INFO testHandler:
 executing task 2
2015-10-14 00:29:52 INFO Task Description:
 I am the task 2, I take 1000msecs.
2015-10-14 00:29:53 INFO testHandler:
 completed task 2
<b>2015-10-14 00:29:53 ERROR This is an error from the task task 2</b>
</code></pre>

Let's take a close look at the status of the workflow and its tasks.
Re-run the demo with the log level of ```debug```
<pre><code>
$ ./bin/processus-cli -l debug -f ./test/demo8.json

...
...

2015-10-14 00:34:54 ERROR This is an error from the task task 2
2015-10-14 00:34:54 DEBUG {
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
      "time-opened": 1444782891803,
      "time-started": 1444782891804,
      "time-completed": 1444782893322,
      "handler-duration": 1518,
      "total-duration": 1519
    },
    "task 2": {
      "description": "I am the task 2, I take 1000msecs.",
      "blocking": true,
      "handler": "../taskHandlers/testHandler",
      "data": {
        "delay": 1000,
        "error": "This is an error from the task task 2"
      },
      <b>"status": "error",</b>
      "time-opened": 1444782893322,
      "time-started": 1444782893323
    },
    "task 3": {
      "description": "I am the task 3, I take 1500msecs.",
      "blocking": true,
      "handler": "../taskHandlers/testHandler",
      "data": {
        "delay": 1500,
        "error": false
      },
      <b>"status": "waiting"</b>
    }
  },
  "status": "open",
  <b>"satus": "error"</b>
}
</code></pre>
**Notice** that the status of task 2 and the workflow are both ```error```. Also note that task 3 has a status ```waiting``` i.e. it was never started!

[top](#processus)

## Task Handlers - The Interface

Processus ships with 2 task handlers:

1. The ```testHandler.js``` (what you've been using for the demos)
2. The ```shellHandler.js``` (A more useful task handler used to execute local shell commands)

The interface for writing a taskHandler is simple:
```
module.exports = function(name, task, callback, logger){

}
```
During execution, Processus calls the task handler passing in the following:

1. **name** A string matching the name of the task
2. **task** The object representing the task
3. **callback** A function the taskhandler MUST call when complete which takes 2 arguments (error, task)
  * **error** An error or null
  * **task** The UPDATED task. i.e. The task handler can update data values and pass them back
4. **logger** A logger relative to the Processus engine, that the task handler can use to log as its running.

If you want to write your own taskHandler (very much encouraged) please look at the examples.

[top](#processus)


## Task Handlers - Shell Handler

Let's take a closer look at the shellHandler

<pre><code>
var exec = require('child_process').exec;

/* Shell Task Handler
 * Using the Task's data.cmd property, this handler will attempt to execute that
 * command as a child process.
 */
module.exports = function(name, task, callback, logger){
  //validate that task data element exists
  if(!task.data) {
    callback(new Error("No task data property!"), task);
  }
  //Validate that the data cmd property has been set
  if(!task.data.cmd) {
    callback(new Error("No data cmd property set!"), task);
  }
  //execute the command and check the response
  exec(task.data.cmd, function(error, stdout, stderr) {
    task.data.stdout = stdout;
    task.data.stderr = stderr;
    if(stdout){ logger.info(stdout); }
    if(stderr){ logger.error(stderr); }
    //let the processus know what happened
    callback(error, task);
  });
};
</code></pre>

**Notice** that the handler performs the following:

1. checks the supplied task contains the data items it expects. i.e. ```task.data.cmd```
2. Executes the command identified by the ```cmd``` data property
3. Captures the response and NEW data items ```stdout``` and ```stderr```
4. Logs the results
5. Calls Processus back with any error and the updated task.

NOTE: the task handler does NOT set the status of the task, ***usually*** Processus will handle that for you.

[top](#processus)


## Task Handlers - Shell Demo

The JSON config file (demo9)
<pre><code>
{
  "tasks":{
    "task 1": {
      "description": "I am the task 1, I echo Processus",
      "blocking": true,
      <b>"handler" : "../taskHandlers/shellHandler",</b>
      "data": {
        <b>"cmd": "echo Processus"</b>
      }
    },
    "task 2": {
      "description": "I am the task 2, I echo Simple",
      "blocking": true,
      <b>"handler" : "../taskHandlers/shellHandler",</b>
      "data": {
        <b>"cmd": "echo Simple"</b>
      }
    },
    "task 3": {
      "description": "I am the task 3, I echo Workflow",
      "blocking": true,
      <b>"handler" : "../taskHandlers/shellHandler",</b>
      "data": {
        <b>"cmd": "echo Workflow"</b>
      }
    }
  }
}
</pre></code>

**Notice** the shell task handler and cmd for each task.


Running the demo
<pre><code>
$ ./bin/processus-cli -l info -f ./test/demo9.json

  ____  ____   __    ___  ____  ____  ____  _  _  ____
 (  _ \(  _ \ /  \  / __)(  __)/ ___)/ ___)/ )( \/ ___)
  ) __/ )   /(  O )( (__  ) _) \___  \___ \) \/ (\___ \
 (__)  (__\_) \__/  \___)(____)(____/(____/\____/(____/

           Processus: A Simple Workflow Engine.

2015-10-14 01:01:57 INFO Processus

2015-10-14 01:01:57 INFO Simple

2015-10-14 01:01:57 INFO Workflow

2015-10-14 01:01:57 INFO Workflow returned successfully.
</code></pre>

**Notice** each task output ```Processus Simple Workflow```

Let's take a closer look at each task by re-running the demo at the debug level.

<pre><code>
$ ./bin/processus-cli -l debug -f ./test/demo9.json

  ____  ____   __    ___  ____  ____  ____  _  _  ____
 (  _ \(  _ \ /  \  / __)(  __)/ ___)/ ___)/ )( \/ ___)
  ) __/ )   /(  O )( (__  ) _) \___  \___ \) \/ (\___ \
 (__)  (__\_) \__/  \___)(____)(____/(____/\____/(____/

           Processus: A Simple Workflow Engine.

2015-10-14 01:07:01 INFO Processus

2015-10-14 01:07:01 INFO Simple

2015-10-14 01:07:01 INFO Workflow

2015-10-14 01:07:01 INFO Workflow returned successfully.
2015-10-14 01:07:01 DEBUG {
  "tasks": {
    "task 1": {
      "description": "I am the task 1, I echo Processus",
      "blocking": true,
      "handler": "../taskHandlers/shellHandler",
      "data": {
        "cmd": "echo Processus",
        <b>"stdout": "Processus\n",
        "stderr": ""</b>
      },
      "status": "completed",
      "time-opened": 1444784821173,
      "time-started": 1444784821174,
      "time-completed": 1444784821215,
      "handler-duration": 41,
      "total-duration": 42
    },
    "task 2": {
      "description": "I am the task 2, I echo Simple",
      "blocking": true,
      "handler": "../taskHandlers/shellHandler",
      "data": {
        "cmd": "echo Simple",
        <b>"stdout": "Simple\n",
        "stderr": ""</b>
      },
      "status": "completed",
      "time-opened": 1444784821215,
      "time-started": 1444784821216,
      "time-completed": 1444784821223,
      "handler-duration": 7,
      "total-duration": 8
    },
    "task 3": {
      "description": "I am the task 3, I echo Workflow",
      "blocking": true,
      "handler": "../taskHandlers/shellHandler",
      "data": {
        "cmd": "echo Workflow",
        <b>"stdout": "Workflow\n",
        "stderr": ""</b>
      },
      "status": "completed",
      "time-opened": 1444784821223,
      "time-started": 1444784821224,
      "time-completed": 1444784821232,
      "handler-duration": 8,
      "total-duration": 9
    }
  },
  "status": "completed"
}
</code></pre>

**Notice** the ```stdout``` and ```stderr``` data properties added to each task in the workflow object.

Hopefully this starts to show the potential power of Processus.

[top](#processus)

## Tasks - Conditions Skip_if and Error_if

Tasks can have the extra properties ```skip_if``` and ```error_if```.

As the names suggest, if either property evaluates to true, then Processus will either skip the task and just mark it as completed or raise an error and stop.

As with sharing data values, you can reference another part of the workflow and have that substituted at execution time. In addition, Processus supports a very simple conditional constructs. As a developer you may have an understandably negative thoughts about some of these, but Processus is designed to be simple to use for those NOT familiar with the nuances of software development and conditional statements.

Conditions are in the form.

```<valueA> [conditional operator] [ValueB]```

Notice, if you want a condition to be evaluated against the ```skip_if``` or ```error_if``` properties of a task, the following should be observed.

```[conditional operator] [ValueB]``` are optional

```<valueA>``` alone is considered to be true if it's value is a boolean of true or any variation of the string "true". All other values are considered false.

The following table shows the options for the conditional operator

|conditional operator| equivalent value|
|--------------------|-----------------|
|EQUALS| equals|
| | = |
| | == |
| | === |
| | is |
|NOT | not |
|    | is not |
|    | ! |
|    | != |
|    | !== |
| > | > |
|   | gt |
|   | more than |
|   | greater than |
| < | < |
|   | lt |
|   | less than |

Look at demo10 to see an example of ```skip_if``` and ```error_if``` in action.

The JSON config file (demo10)
<pre><code>
{
  "tasks":{
    "task 1": {
      "description": "I am the task 1, I echo Processus",
      "blocking": true,
      "handler": "../taskHandlers/shellHandler",
      "data": {
        "cmd": "echo Processus",
        "skip me": "yeah"
      }
    },
    "task 2": {
      "description": "I am the task 2, I will be skipped",
      "blocking": true,
      <b>"skip_if":"$[tasks.task 1.data.skip me] is yeah",</b>
      "handler": "../taskHandlers/shellHandler",
      "data": {
        "cmd": "echo Simple"
      }
    },
    "task 3": {
      "description": "I am the task 3, I will error",
      "blocking": true,
      <b>"error_if": "$[tasks.task 2.skip_if]",</b>
      "handler": "../taskHandlers/shellHandler",
      "data": {
        "cmd": "echo Workflow"
      }
    }
  }
}
</code></pre>

**Notice** the skip_if and error_if properties of tasks 2 and 3.

```$[tasks.task 1.data.skip me] is yeah``` will become ```yeah is yeah``` at execution time, evaluating to true, so the task will be skipped.

```$[tasks.task 2.skip_if]``` will become ```true``` because that's what the skip_if will evaluate to.

Running the demo
<pre><code>
$ ./bin/processus-cli -f test/demo10.json -l debug

  ____  ____   __    ___  ____  ____  ____  _  _  ____
 (  _ \(  _ \ /  \  / __)(  __)/ ___)/ ___)/ )( \/ ___)
  ) __/ )   /(  O )( (__  ) _) \___  \___ \) \/ (\___ \
 (__)  (__\_) \__/  \___)(____)(____/(____/\____/(____/

           Processus: A Simple Workflow Engine.

2015-10-20 15:00:39 DEBUG task.skip_if = undefined
2015-10-20 15:00:39 DEBUG task.error_if = undefined
2015-10-20 15:00:39 INFO Processus

2015-10-20 15:00:39 DEBUG Getting data for path: tasks.task 1.data.skip me
2015-10-20 15:00:39 DEBUG $[tasks.task 1.data.skip me] is yeah has ref: tasks.task 1.data.skip me
2015-10-20 15:00:39 DEBUG $[tasks.task 1.data.skip me] is yeah de-referenced value is: yeah is yeah
2015-10-20 15:00:39 DEBUG evaluating condition yeah is yeah
2015-10-20 15:00:39 DEBUG task.skip_if = true
2015-10-20 15:00:39 DEBUG task.error_if = undefined
2015-10-20 15:00:39 DEBUG Getting data for path: tasks.task 2.skip_if
2015-10-20 15:00:39 DEBUG $[tasks.task 2.skip_if] has ref: tasks.task 2.skip_if
2015-10-20 15:00:39 DEBUG $[tasks.task 2.skip_if] de-referenced value is: true
2015-10-20 15:00:39 DEBUG evaluating condition true
2015-10-20 15:00:39 DEBUG task.skip_if = undefined
2015-10-20 15:00:39 DEBUG task.error_if = true
2015-10-20 15:00:39 ERROR Task has error condition set.
2015-10-20 15:00:39 DEBUG {
  "tasks": {
    "task 1": {
      "description": "I am the task 1, I echo Processus",
      "blocking": true,
      "handler": "../taskHandlers/shellHandler",
      "data": {
        "cmd": "echo Processus",
        "skip me": "yeah",
        "stdout": "Processus\n",
        "stderr": ""
      },
      "status": "completed",
      "time-opened": 1445353239367,
      "time-started": 1445353239369,
      "time-completed": 1445353239395,
      "handler-duration": 26,
      "total-duration": 28
    },
    "task 2": {
      "description": "I am the task 2, I will be skipped",
      "blocking": true,
      "skip_if": true,
      "handler": "../taskHandlers/shellHandler",
      "data": {
        "cmd": "echo Simple"
      },
      "status": "completed",
      "time-opened": 1445353239395,
      "time-started": 1445353239397,
      "time-completed": 1445353239398,
      "handler-duration": 1,
      "total-duration": 3
    },
    "task 3": {
      "description": "I am the task 3, I will error",
      "blocking": true,
      "error_if": true,
      "handler": "../taskHandlers/shellHandler",
      "data": {
        "cmd": "echo Workflow",
        "error": "Task has error condition set."
      },
      "status": "error",
      "time-opened": 1445353239398,
      "time-started": 1445353239399
    }
  },
  "status": "error"
}
</code></pre>

**Notice** that because the ```skip_if``` and ```error_if``` properties of task 1 are undefined, no evaluation of the condition takes place and the task executes normally. Task 2 did complete, but because the ```skip_if``` evaluates to true, the task handler is NOT executed. Therefore the ```'echo Simple'``` did not execute. Finally, notice that task 3 is in the error status (due to the ```error_if``` condition) and therefore so is the workflow.

[top](#processus)

# Contributing

TBC

## Contributing - Roadmap

1. Workflow Persistence Plugin Architecture
 * filebased, default
 * Mongodb
2. Restarting a paused workflow (allowing for Async handlers)
3. Full REST API to intract with Processus
 * Swagger yaml
4. HTTP Handler allowing Processus to interact with remote endpoints during workflow execution
5. Workflow Handler allowing a task to create another workflow (i.e. nested Sync and Async Workflows)
6. Support for nested tasks "injected" at executon by handlers

[top](#processus)
