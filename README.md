# mongo-flyway
## Description
This plugin can be used to migrate your MongoDB schema.
## Notice
In your app require the module
<pre><code>var mongo-flyway = require('mongo-flyway');</code></pre>
And then call update function with options argument
<pre><code>
mongo-flyway.update({
    dbUri:'mongodb://localhost:27017/test'
    folder:__dirname + '/db'
});
</code></pre>
In the given folder, put your update files.
Each file must be named following this pattern :
<pre><code>[number]_[desciption].js</pre></code>
Example :
<pre><code>001_add_creation_date_field_default_value_today.js</pre></code>
Each file must export a function called execute
<pre><code>module.exports.execute = function (db, fn) {
    fn();
};</pre></code>
## General options
### Update options
#### dbUri : (String)
Uri of your MongoDB instance with the database name
#### folder : (String)
Absolute path where are your update files
### Execute function parameters
#### db
MongoDB connection
#### fn
Callback function to invoke at the end of the upgrade.
Can take in parameter an Error if an error occurred