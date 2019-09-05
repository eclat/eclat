export function Enumerable(value: boolean) {
    return function(target: any, propertyKey: string) {
        if (!value) {
            // didnt ask to enumerate, nothing to do because even enumerables at the prototype wont
            // appear in the JSON
            return;
        }
        if (target.toJSON && !target.__propsToMakeEnumerable) {
            return; // previously existing toJSON, nothing to do!
        }
        target.__propsToMakeEnumerable = (target.__propsToMakeEnumerable || []).concat([
            {
                propertyKey,
                value
            }
        ]);

        target.toJSON = function() {
            let self = this; // JSFiddle transpiler apparently is not transpiling arrow functions properly
            if (!this.__propsToMakeEnumerableAlreadyProcessed) {
                // so we just do this once
                let propsToMakeEnumerable = self.__propsToMakeEnumerable;
                (propsToMakeEnumerable || []).forEach(({ propertyKey, value }) => {
                    let descriptor = Object.getOwnPropertyDescriptor(self.__proto__, propertyKey);
                    descriptor!.enumerable = true;
                    Object.defineProperty(self, propertyKey, descriptor!);
                });
                Object.defineProperty(this, '__propsToMakeEnumerableAlreadyProcessed', {
                    value: true,
                    enumerable: false
                });
            }
            return this;
        };
    };
}
