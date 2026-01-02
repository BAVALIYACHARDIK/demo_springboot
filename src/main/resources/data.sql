-- Insert communities organized by category

-- Programming Languages
INSERT IGNORE INTO communities (name) VALUES ('C');
INSERT IGNORE INTO communities (name) VALUES ('C++');
INSERT IGNORE INTO communities (name) VALUES ('C#');
INSERT IGNORE INTO communities (name) VALUES ('Java');
INSERT IGNORE INTO communities (name) VALUES ('Python');
INSERT IGNORE INTO communities (name) VALUES ('JavaScript');
INSERT IGNORE INTO communities (name) VALUES ('TypeScript');
INSERT IGNORE INTO communities (name) VALUES ('Go (Golang)');
INSERT IGNORE INTO communities (name) VALUES ('Rust');
INSERT IGNORE INTO communities (name) VALUES ('Kotlin');
INSERT IGNORE INTO communities (name) VALUES ('Swift');
INSERT IGNORE INTO communities (name) VALUES ('PHP');
INSERT IGNORE INTO communities (name) VALUES ('Ruby');
INSERT IGNORE INTO communities (name) VALUES ('R');
INSERT IGNORE INTO communities (name) VALUES ('MATLAB');
INSERT IGNORE INTO communities (name) VALUES ('Dart');
INSERT IGNORE INTO communities (name) VALUES ('Scala');
INSERT IGNORE INTO communities (name) VALUES ('Objective-C');
INSERT IGNORE INTO communities (name) VALUES ('Bash / Shell');
INSERT IGNORE INTO communities (name) VALUES ('PowerShell');
INSERT IGNORE INTO communities (name) VALUES ('Lua');
INSERT IGNORE INTO communities (name) VALUES ('Haskell');
INSERT IGNORE INTO communities (name) VALUES ('Perl');
INSERT IGNORE INTO communities (name) VALUES ('Groovy');
INSERT IGNORE INTO communities (name) VALUES ('Assembly');

-- Web Development - Frontend
INSERT IGNORE INTO communities (name) VALUES ('HTML');
INSERT IGNORE INTO communities (name) VALUES ('CSS');
INSERT IGNORE INTO communities (name) VALUES ('React.js');
INSERT IGNORE INTO communities (name) VALUES ('Angular');
INSERT IGNORE INTO communities (name) VALUES ('Vue.js');
INSERT IGNORE INTO communities (name) VALUES ('Svelte');
INSERT IGNORE INTO communities (name) VALUES ('Next.js');
INSERT IGNORE INTO communities (name) VALUES ('Nuxt.js');
INSERT IGNORE INTO communities (name) VALUES ('Remix');
INSERT IGNORE INTO communities (name) VALUES ('Astro');
INSERT IGNORE INTO communities (name) VALUES ('Tailwind CSS');
INSERT IGNORE INTO communities (name) VALUES ('Bootstrap');
INSERT IGNORE INTO communities (name) VALUES ('Material UI');
INSERT IGNORE INTO communities (name) VALUES ('Chakra UI');
INSERT IGNORE INTO communities (name) VALUES ('jQuery');

-- Web Development - Backend
INSERT IGNORE INTO communities (name) VALUES ('Node.js');
INSERT IGNORE INTO communities (name) VALUES ('Express.js');
INSERT IGNORE INTO communities (name) VALUES ('NestJS');
INSERT IGNORE INTO communities (name) VALUES ('Spring Boot');
INSERT IGNORE INTO communities (name) VALUES ('Spring MVC');
INSERT IGNORE INTO communities (name) VALUES ('Django');
INSERT IGNORE INTO communities (name) VALUES ('Flask');
INSERT IGNORE INTO communities (name) VALUES ('FastAPI');
INSERT IGNORE INTO communities (name) VALUES ('Ruby on Rails');
INSERT IGNORE INTO communities (name) VALUES ('Laravel');
INSERT IGNORE INTO communities (name) VALUES ('ASP.NET Core');
INSERT IGNORE INTO communities (name) VALUES ('Gin (Go)');
INSERT IGNORE INTO communities (name) VALUES ('Fiber (Go)');
INSERT IGNORE INTO communities (name) VALUES ('Phoenix (Elixir)');

-- Mobile App Development
INSERT IGNORE INTO communities (name) VALUES ('Android Development');
INSERT IGNORE INTO communities (name) VALUES ('iOS Development');
INSERT IGNORE INTO communities (name) VALUES ('Flutter');
INSERT IGNORE INTO communities (name) VALUES ('React Native');
INSERT IGNORE INTO communities (name) VALUES ('SwiftUI');
INSERT IGNORE INTO communities (name) VALUES ('Kotlin Multiplatform');
INSERT IGNORE INTO communities (name) VALUES ('Xamarin');
INSERT IGNORE INTO communities (name) VALUES ('Ionic');
INSERT IGNORE INTO communities (name) VALUES ('Cordova');

-- Database Technologies - Relational
INSERT IGNORE INTO communities (name) VALUES ('MySQL');
INSERT IGNORE INTO communities (name) VALUES ('PostgreSQL');
INSERT IGNORE INTO communities (name) VALUES ('Oracle');
INSERT IGNORE INTO communities (name) VALUES ('SQL Server');
INSERT IGNORE INTO communities (name) VALUES ('SQLite');
INSERT IGNORE INTO communities (name) VALUES ('MariaDB');

-- Database Technologies - NoSQL
INSERT IGNORE INTO communities (name) VALUES ('MongoDB');
INSERT IGNORE INTO communities (name) VALUES ('Cassandra');
INSERT IGNORE INTO communities (name) VALUES ('Redis');
INSERT IGNORE INTO communities (name) VALUES ('DynamoDB');
INSERT IGNORE INTO communities (name) VALUES ('CouchDB');
INSERT IGNORE INTO communities (name) VALUES ('Firebase Firestore');
INSERT IGNORE INTO communities (name) VALUES ('Neo4j (Graph DB)');

-- Insert initial flags if they don't exist
INSERT IGNORE INTO flags (name) VALUES ('Error');
INSERT IGNORE INTO flags (name) VALUES ('Doubt');
INSERT IGNORE INTO flags (name) VALUES ('Meme');
INSERT IGNORE INTO flags (name) VALUES ('How To');
