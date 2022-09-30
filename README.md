#FwkAnalyzer Web

FwkAnalyzer is a tool for helping determine developer expertise in a specific framework or library. This is done by
comparing the framework usage of a developer's contributions in GitHub public repositories with a previously generated
benchmark.

This is the frontend project. The backend project is available on the following link:
https://github.com/ghdeassis/fwkanalyzer-api

##Setup

Install the dependencies with the following command:

``npm install``

##How to run

To run the project, execute the following command:

``npm start``

The user must choose the framework and enter the developer's email on the page. This email will be used to search for
contributions in the selected framework on GitHub. The interface will show graphs comparing the
developer metrics with the framework benchmark with this information.
