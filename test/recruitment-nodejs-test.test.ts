import { expect as expectCDK, SynthUtils, haveResource, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as RecruitmentNodejsTest from '../lib/recruitment-nodejs-test-stack';

describe('RecruitmentNodeJsTestStack Stack', () => {
    const app = new cdk.App();
    const stack = new RecruitmentNodejsTest.RecruitmentNodejsTestStack(app, 'MyTestStack');
    // expectCDK(stack).to(matchTemplate({
    //   "Resources": {}
    // }, MatchStyle.EXACT))

    // three node.js lambdas are used
    test('Lambdas creation', () => {
      expectCDK(stack).to(haveResource("AWS::Lambda::Function"));
    });
});