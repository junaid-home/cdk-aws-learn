import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as apigw from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";

import LambdaFunctions from "../function/lambda";

class ApiGateway {
  private _httpApi: apigw.HttpApi;
  private _lambdaFunctions: LambdaFunctions;
  private _apiIntegration: HttpLambdaIntegration;

  constructor(scope: Construct, id: string) {
    this._lambdaFunctions = new LambdaFunctions(scope, id);

    this._httpApi = new apigw.HttpApi(scope, `${id}-api-gateway-v2`, {
      description: "HTTP API responsible for proxy incomming request to lambda",
      corsPreflight: {
        allowHeaders: ["Content-Type", "Authorization"],
        allowMethods: [
          apigw.CorsHttpMethod.OPTIONS,
          apigw.CorsHttpMethod.GET,
          apigw.CorsHttpMethod.POST,
          apigw.CorsHttpMethod.PUT,
          apigw.CorsHttpMethod.PATCH,
          apigw.CorsHttpMethod.DELETE,
        ],
        allowCredentials: true,
        allowOrigins: ["http://localhost:3000"],
      },
    });

    this._apiIntegration = new HttpLambdaIntegration(
      `${id}-api-gateway-v2-integration`,
      this._lambdaFunctions.gqlRootLambda
    );

    this._httpApi.addRoutes({
      path: "/graphql",
      methods: [apigw.HttpMethod.POST],
      integration: this._apiIntegration,
    });

    new cdk.CfnOutput(scope, "apiUrl", {
      value: this._httpApi.url!,
    });
  }
}

export default ApiGateway;
