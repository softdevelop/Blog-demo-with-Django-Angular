# Install guide #


### Install Django ###

* virtualenv -p /usr/bin/python3.5 venv
* source venv/bin/activate
* cd root-folder-of-this-site
* python3 manage.py migrate
* python3 manage.py createsuperuser
* python3 manage.py runserver

### Install Angular ###

* cd source
* sudo npm install
* sudo npm run start

Run http://localhost:8000
