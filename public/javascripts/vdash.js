class VDash {
    constructor(remote) {
	this.remote = remote;
    }

    evaluate(expression,ui) {
	console.log ("Evaluating: ", expression);
	this.remote.evaluate(expression,ui);
    }
}
