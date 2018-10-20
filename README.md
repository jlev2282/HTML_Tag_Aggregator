# HTML_Tag_Aggregator
This script will scan an HTML file or directory of files and add up the tags in each file, giving them a score and other aggregate information

Business Case
----
A new search engine just hit the market, and their search result rankings are determined by the type and number of HTML tags used on a website. Your company wants to make sure all of their web pages are going to perform well in this new search engine, and have asked you to build a tool for the SEO team that will help them keep tabs on how your pages are scoring in the new search engine.

The tool needs to calculate the score for a given HTML file and save the score, as well as the date and time it was calculated, so that the SEO team can track quality changes over time. They want to be able to pull data about files quickly, and have asked for the ability to retrieve all scores generated in a provided date range, retrieve the all time highest score for a given file, the all time lowest score for a given file, and to see the average score for a given file.

In the data folder of this project you'll find the company's existing files, which you should use for testing your application.

Technical Requirements
-----------------
Create a program in the language of your choice that will read HTML files, calculate scores based on the set of rules provided below, and then save the score for each file. Changes to the content can be re-run over time to determine improvement or regression of the score. Each unique run should be stored with the date and time it was run along with the score received for the file.

You may use external libraries if you feel they will help, but you should keep them separate from the code that you yourself have written.

* Score HTML content using the provided scoring guide
* Save results to a SQL database (MySQL, SQL Server, sqlite, SQL Server Express)
* A user should be able to retrieve all scores for a given file
* A user should be able to retrieve all scores run in the system for a custom date range
* A user should be able to retrieve highest score for a given file
* A user should be able to retrieve lowest score for a given file
* A user should be able to retrieve the average score for each unique file name

* Finally, include instructions on how to get your code running. This should include the version of whatever language used, as well as what platform (windows/osx/linux, etc) you are on, and how to install any and all dependencies that are required to run your program. This helps us get running with your code.

**Example of instructions and platform specifications**

>**Languages and tools used:**
>
>- Node v8.4.0
>- NPM v5.3.0
>- MySQL 5.7.17
>- SublimeText3 as my IDE
>- macOS High Sierra
>
>**Instructions**
>
>1. Start a local SQL server instance (I used 'mysql.server start' in the Terminal).
>2. Run SQL commands found in /schema/markup_schema.sql to create the database and tables.
>3. Navigate to the src/ directory
>4. run `npm install` to install all dependencies
>4. run `npm start` to start up the program

Scoring Rules
-------------
Each starting tag in the table below has been assigned a score. Any tags not listed in this table will not factor into scoring. Each tag in the content should be added to or subtracted from the total score based on this criteria.

| TagName | Score Modifier | TagName | Score Modifier |
| ------- | :------------: | ------- | -------------- |
| div     | 3              | font    | -1             |
| p       | 1              | center  | -2             |
| h1      | 3              | big     | -2             |
| h2      | 2              | strike  | -1             |
| html    | 5              | tt      | -2             |
| body    | 5              | frameset| -5             |
| header  | 10             | frame   | -5             |
| footer  | 10             |

example:

````
<html>
    <body>
      <p>foo</p>
      <p>bar</p>
      <div text-align='center'>
        <big>hello world</big>
      </div>
    </body>
</html>
````

2 p tags = 2 x 1 <br>
1 body tag = 1 x 5 <br>
1 html tag = 1 x 5 <br>
1 div tag = 1 x 3 <br>
1 big tag = 1 x -2 <br>
**Total Score: 13**

## Deliverables
* The source code for your solution.
* The database schema you use to implement your solution.
* Any additional documentation you feel is necessary to explain how your application works, or describe your thought process and design decisions.

## Bonus Points
* Your program treats tag names as case-insensitive (ie: Html evaluates the same as html)
* Parse multiple files at the same time for performance
* Handle invalid or poorly formatted HTML. Example:

````
<html>
    <body>
      <p>foo</p> <p>bar</p>
      <div text-align='center'> <big>hello world</big> </div>
    </body>
/html>
````


