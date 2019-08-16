# Crawly
##For the extension:

Download the repo, then go to "chrome://extensions"
Turn on developer mode, and click on "load unpacked"
Select the "crawly_extension" folder


##For the script:
In the repo, run
npm init -y
npm install --save puppeteer chalk
npm install --save esm
To run the crawly:
node -r esm puppet.js

###### Note: currently only works on locator pages with "search" in the url :(
