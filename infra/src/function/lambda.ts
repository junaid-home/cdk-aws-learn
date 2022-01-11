import * as path from "path";
import * as lambda from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

class LambdaFunctions {
  /**
   * Lambda function responsible for handling all Graphql Api Requests
   */
  private _gqlRootLambda: lambda.NodejsFunction;

  constructor(scope: Construct, id: string) {
    this._gqlRootLambda = new lambda.NodejsFunction(
      scope,
      `${id}-root-graphql-lambda`,
      {
        handler: "handler",
        entry: path.join(__dirname, "../../../lambda/src/app.ts"),
        functionName: `${id}-root-graphql-lambda`,
        memorySize: 248,
      }
    );
  }

  public get gqlRootLambda() {
    return this._gqlRootLambda;
  }
}

export default LambdaFunctions;
