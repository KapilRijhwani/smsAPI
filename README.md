# smsAPI

Modules used
* Express
* Basic-Auth
* Redis
* Pg

----------------------------
API /inbound/sms
Parameters :
* from : required + length(6-16)
* to : required + length(6-16)
* text : required + length(2-120)

----------------------------
Authenticate : 
Using the account table

----------------------------
Validate : 
check the to is associated with the username used during basic authentication

----------------------------
API /outbound/sms
Parameters :
* from : required + length(6-16)
* to : required + length(6-16)
* text : required + length(2-120)

----------------------------
Authentication : 
Using the account table

----------------------------
Validation : 
check the from is associated with the username used during basic authentication


----------------------------
----------------------------
Things learnt during assignment : 
	Node JS
		Modules learnt : 
			express
			pg
			basic-auth
			redis
			joi(not used since we wanted to send back custom JSON for validation)
	
	Heroku : 
		Setup heroku
		Deploy NodeJs Application
		Using the add on for PostgreSQL
	
	PostgreSQL :
		Setup and basic usage
	

----------------------------
Challenges faced :
	Asynchronous calling of pool.query while fetching the result from DB
	
----------------------------
Pending tasks :
	Caching related tasks.
	Deploying NodeJs Application to Heroku.

----------------------------
----------------------------
