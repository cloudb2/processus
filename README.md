# Processus

Processus is a simple lightweight workflow engine designed to help orchestrate multiple tasks.

There are many workflow engines already, but Processus makes some very specific assumptions that make it easy to quickly write simple, yet powerful
workflows.

* [Installation](#installation)
* [Overview](#overview)
  * [Workflow](#workflow)
  * [Tasks](#tasks)
  * [User Guide](http://cloudb2.github.io/processus/)
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

## Overview

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



## Contributing - Roadmap

* Workflow Persistence Plugin Architecture
  * filebased, default
  * Mongodb
* Full REST API to interact with Processus
  * Swagger yaml
* Support for environment variables
