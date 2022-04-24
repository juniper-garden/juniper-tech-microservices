const exampleAlert:any = {
    conditions: {
        any: [{
            all: [{
                fact: 'reading',
                operator: 'greaterThanInclusive',
                value: 10,
                path: '$.temp'
            }, {
                fact: 'humidity',
                operator: 'lessThanInclusive',
                value: 50,
                path: '$.humidity'
            }]
        }]
    },
    event: {
        type: 'pushNotification',
        params: {
            message: 'Player has fouled out!'
        }
    }
}

describe('alerts', () => {
    it('needs tests', () => {
        expect(true).toBe(true);
    })
});
