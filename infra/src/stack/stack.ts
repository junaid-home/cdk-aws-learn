import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";

import ApiGateway from "../api/apigw-v2";

class CfnStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    new ApiGateway(this, id);
  }
}

export default CfnStack;
