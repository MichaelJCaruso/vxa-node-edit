class RemoteObjectHandler {
    constructor () {
    }
    get(target,property,receiver) {
        const args={handler:this,target,property};
        console.log ('get: ', args);
        return function (...args) {
            return {target, property, args};
        }
    }
    set(target,property,value,receiver) {
        const args={handler:this,target,property,value};
        console.log ('set: ', args);
        return Reflect.set(target,property,value,receiver);
    }
    apply (target,thisArgument,argumentList) {
        const args={handler:this,target,thisArgument,argumentList};
        console.log ('apply:', args);
        return args;
    }
}

class FunctionProxyHandler extends RemoteObjectHandler {
    constructor () {
        super ();
    }
    apply (target,receiver,args) {
    }
}

class Export {
}

class Import {
    constructor (obj) {
        Object.setPrototypeOf(
            this, new Proxy(function(){},new RemoteObjectHandler (obj))
        );
    }
}

class Site {
    constructor () {
    }
}

class Self extends Site {
    constructor () {
        super ();
    }
}

class Peer extends Site {
    constructor () {
        super ();
    }
}

module.exports = function (obj) {
//    return new Import (obj)
    return new Proxy(function(){},new RemoteObjectHandler (obj));
}

module.exports.Import = Import;
module.exports.Export = Export;

/*****************/
module.exports.Module = function () {
    return module;
}
module.exports.Reload = function () {
    module.exports.Unload ();
    return require (module.filename);
}
module.exports.Unload = function () {
    return delete require.cache[module.filename];
}
