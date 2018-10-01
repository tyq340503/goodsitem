1.the database has already upload to the cloud, so just npm start or node app to start the project
don't need to start mongo clinet.

2.the whole project have some serval pages
	index page: show all the itme you post on the website
	login page: login to our website
	register page: register a new account
	search page: you can search some key words on this website
	new page: after login you can post a new thing on this website
	404 page: if you have wrong url it will redirect to error page

3.things we add after we record the video
	add new style in our website
	add 404 page
	add search bar in the header
	
	
If you wish to compile in a Linux environment, you can install ubuntu on Windows 10

( You don't have to do this if you have no issue building and running your ocaml files )

( I am only providing a different option )

( If you have an issue installing, attach a screenshot of your issue )

 

// install ubuntu from windows store (the latest version!!!)
// go to windows powershell as admin and enter
Enable-WindowsOptionalFeature -Online -Featurename Microsoft-Windows-Subsystem-Linux
// you will need to restart

// to switch between your linux acc and root user, open windows CMD as ADMIN
ubuntu config --default-user yourusername
ubuntu config --default-user root
// or if you have ubuntu 18.04 (use whatever version number you have)
ubuntu1804 config --default-user yourusername
ubuntu1804 config --default-user root
// after each switch you need to restart ubuntu

****PLEASE do the installation under your own linux acc, NOT under root user****

// make a linux acc, as root user
adduser yourusername

// make your linux acc a su (super user), as root user
usermod -aG sudo yourusername

// to check your linux user name
whoami

// change starting directory
cd ~
nano ~/.bashrc
// at the end of the file add "cd /mnt/c/your/directory". ctrl+o to save, ctrl+x to exit

// update all your ubuntu software packages (If ubuntu says it cant find package, etc, do this)
sudo apt-get update
sudo apt-get upgrade
****Always update your ubuntu to the latest version****
// auto update missing files
sudo apt-get update --fix-missing

**** IMPORTANT ****
// NOTE: if ubuntu tells you to run a command, run it
// NOTE: if ubuntu asks you to continue or not, press "y" and enter
// NOTE: if ubuntu gives you options "yes/no" and says the default is "no", then choose "no"
// NOTE: if ubuntu tells you that a package is missing, run the following command
sudo apt install packagename
**** Example: if missing a package called "m4", run****
sudo apt install m4
****

// install ocaml/opam on ubuntu
sudo apt install ocaml
opam init
eval `opam config env`

// install utop packages (NOTE: merlin version could be different, use latest version)
opam install merlin.3.1.0 utop ocamlfind menhir oUnit ocp-indent

// update opam (if not up to date)
// "opam update" checks for update, "opam upgrade" does the actual upgrade
opam update
opam upgrade
****always check for update****

// simplify user setup for various editors
opam user-setup install

#### END OF INSTALLATION ####
