class VDash {
    constructor(remote) {
	this.remote = remote;
    }

    evaluate(expression) {
	console.log ("Evaluating: ", expression);
	return this.remote.evaluate(expression); // ... returns a Promise for the result
    }
}
