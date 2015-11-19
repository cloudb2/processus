```
 ____  ____   __    ___  ____  ____  ____  _  _  ____
(  _ \(  _ \ /  \  / __)(  __)/ ___)/ ___)/ )( \/ ___)
 ) __/ )   /(  O )( (__  ) _) \___  \___ \) \/ (\___ \
(__)  (__\_) \__/  \___)(____)(____/(____/\____/(____/
```

# Processus

Processus is a simple lightweight workflow engine designed to help orchestrate multiple tasks.

There are many workflow engines already, but Processus makes some very specific assumptions that make it easy to quickly write simple, yet powerful
workflows.



[Getting Started](#getting-started)
  [Installation](#installation)
  [Intoduction](#introduction)
  [documentation](http://cloudb2.github.io/processus/)

[Contributing](#contributing)
  [Contributing - Roadmap](#contributing---roadmap)

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
structure. The best way to understand that structure is by looking at examples.

A workflow, in it's simplest form, is defined as follows.

```
{
  "tasks": {
  },
  "id": "[instance UUID]"
  "status": "[open|error|completed]"
}
```
Both id and status are added by processus at execution time.

execute the above example ex1.json using the following command.
```
../bin/processus-cli -l info -f ./test/ex1.json
```

You should see something like this.
```
$ ./bin/processus-cli -l info -f test/ex1.json

  ____  ____   __    ___  ____  ____  ____  _  _  ____
 (  _ \(  _ \ /  \  / __)(  __)/ ___)/ ___)/ )( \/ ___)
  ) __/ )   /(  O )( (__  ) _) \___  \___ \) \/ (\___ \
 (__)  (__\_) \__/  \___)(____)(____/(____/\____/(____/

           Processus: A Simple Workflow Engine.

2015-11-12 00:59:16 INFO ✰ Workflow [test/ex1.json] exited without error, but did not complete.
```
***Note***
1. You can add additional meta data to the workflow such as a name and description, but that will be ignored by Processus.
2. The status of a workflow can be open, error or completed.
3. In this example there are no tasks, so the Processus returns open, assuming that a task will be injected later. More on this later.

execute ex1 again, this time with a log level of debug.
```
../bin/processus-cli -l info -f ./test/ex1.json
```

You should see something like this.
```
$ ./bin/processus-cli -l debug -f test/ex1.json

  ____  ____   __    ___  ____  ____  ____  _  _  ____
 (  _ \(  _ \ /  \  / __)(  __)/ ___)/ ___)/ )( \/ ___)
  ) __/ )   /(  O )( (__  ) _) \___  \___ \) \/ (\___ \
 (__)  (__\_) \__/  \___)(____)(____/(____/\____/(____/

           Processus: A Simple Workflow Engine.

2015-11-12 01:02:00 DEBUG save point a reached.
2015-11-12 01:02:00 DEBUG save point c reached.
2015-11-12 01:02:00 DEBUG Workflow returned successfully.
2015-11-12 01:02:00 DEBUG {
  "tasks": {},
  "status": "open",
  "id": "33fda8ab-4cac-4acb-80fa-65c731eb6983"
}
2015-11-12 01:02:00 INFO ✰ Workflow [test/ex1.json] exited without error, but did not complete.
```
***Note***
1. The status and id have been added by Processus


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
      "timeOpened": 1444690654882,
      "timeStarted": 1444690654883,
      "timeCompleted": 1444690655396,
      "handlerDuration": 513,
      "totalDuration": 514
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
      "timeOpened": 1444690655396,
      "timeStarted": 1444690655396,
      "timeCompleted": 1444690656403,
      "handlerDuration": 1007,
      "totalDuration": 1007
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
      "timeOpened": 1444690656404,
      "timeStarted": 1444690656404,
      "timeCompleted": 1444690657908,
      "handlerDuration": 1504,
      "totalDuration": 1504
    }
  },
  "status": "completed"
}
```

**Notice** that the Processus engine has added additional information to each task and the parent workflow objects.

This includes the following:

1. **status** A status for each task and the overall workflow
2. **timeOpened** The time (milliseconds elapsed since 1 January 1970 00:00:00 UTC up until now) the task was opened.
3. **timeStarted** The time the task was started. Later we'll explore why this can be different to timeOpened
4. **timeCompleted** The time the task completed
5. **handlerDuration** The time it took the handler to execute the task
6. **totalDuration** The total duration the task was opened. Later we'll explore why this can be different to handlerDuration
[top](#processus)

<hr>
