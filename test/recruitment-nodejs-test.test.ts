import {
  expect as expectCDK,
  matchTemplate,
  MatchStyle,
  haveResource
} from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import * as RecruitmentNodejsTest from "../lib/recruitment-nodejs-test-stack";

// TODO update test
test.skip("RecruitmentNodeJsTestStack", () => {
  let stack: RecruitmentNodejsTest.RecruitmentNodejsTestStack;
  beforeAll(() => {
    const app = new cdk.App();
    stack = new RecruitmentNodejsTest.RecruitmentNodejsTestStack(
      app,
      "MyTestStack"
    );
  });
  // expectCDK(stack).to(matchTemplate({
  //   "Resources": {}
  // }, MatchStyle.EXACT))

  // test("Lambdas creation", () => {
  //   expectCDK(stack).to(haveResource("AWS::Lambda::Function"));
  // });

  // test("Database DynamoDB creation", () => {
  //   expectCDK(stack).to(haveResource("AWS::DynamoDB::Table"));
  // });

  // test("Database DynamoDB creation", () => {
  //   console.log("STACK", stack.node.children)
  //   expect(stack.node.children).toMatch({
  //     UsersTable: [UsersTable],
  //     "user-donations-api": [RestApi],
  //     sendPhoneNumber: [CfnParameter],
  //     CreateUserHandler: [NodejsFunction],
  //     AssetParameters: [Construct],
  //     GetUserHandler: [NodejsFunction],
  //     CreateDonationHandler: [NodejsFunction],
  //   });
  // });
});
