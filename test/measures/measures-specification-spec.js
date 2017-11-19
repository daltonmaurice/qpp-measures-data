const chai = require('chai');
const assert = chai.assert;
const rp = require('request-promise');
const Promise = require('bluebird');

const measuresData = require('../../index.js');

function checkUrl(s) {
  return rp({method: 'HEAD', uri: s.url})
    .then(body => {
      return ({
        measureId: s.measureId,
        submissionMethod: s.url,
        success: true,
        httpStatus: body.statusCode
      });
    })
    .catch(body => {
      return ({
        measureId: s.measureId,
        submissionMethod: s.url,
        success: false,
        httpStatus: body.statusCode
      });
    });
};

describe('measures specification', function() {
  it('should have valid specification links', function() {
    this.timeout(20000); // 20 seconds timeout.
    const specs = [];
    const measures = measuresData.getMeasuresData();
    measures
      .map(m => ({measureId: m.measureId, measureSpecification: m.measureSpecification}))
      .filter(s => !!s.measureSpecification)
      .forEach(s => {
        Object.values(s.measureSpecification).forEach(url => {
          specs.push({measureId: s.measureId, url: url});
        });
      });

    return Promise.map(specs, s => checkUrl(s))
      .then(results => {
        const failures = results.filter(r => !r.success);
        if (failures.length > 0) {
          console.log(failures);
        }
        assert.equal(0, failures.length, 'One or more measure specifications link is invalid');
      });
  });
});
