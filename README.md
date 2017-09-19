# Workflow-Automation

:fire: :fire: :fire:

### Xendit

* Get Balance

To Get Balance
```javascript
    get_Balance(secret_key, (err,data) => {
    	if(err) {
        	console.log(err)
        } else {
        	console.log(data)
        }
    })
```

* Create Invoice

To Create Invoice
```javascript
    create_Invoice(secret_key,external_id,email,desc,amount,(err,data) => {
    	if(err){
        	console.log(err)
        } else {
        	console.log(data)
        }
    }

```

### Nexmo

* Send Sms
To send SMS

```javascript
	Sms(api_key,api_secret,to,from,text, (err,data) => {
   		if(err) {
        	console.log(err)
        } else {
        	console.log(data)
        }
    })

```


Thanks you 🦄🦄🦄🦄