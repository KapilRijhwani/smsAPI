# smsAPI


Modules used
* Express
* Basic-Auth
* Redis
* Pg

API /inbound/sms
Parameters :
* from : required + length(6-16)
* to : required + length(6-16)
* text : required + length(2-120)

Authenticate : 
Using the account table

Validate : 
check the to is associated with the username used during basic authentication

API /outbound/sms
Parameters :
* from : required + length(6-16)
* to : required + length(6-16)
* text : required + length(2-120)

Authenticate : 
Using the account table

Validate : 
check the from is associated with the username used during basic authentication
