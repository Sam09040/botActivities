import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Array', function () {
    describe('#indexOf()', function () {
        it('should return -1 when the value is no present', function () {
            expect([1,2,3].indexOf(4)).to.equal(-1);
        });
    });
});