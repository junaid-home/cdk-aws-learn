import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigwAuthorizers from "@aws-cdk/aws-apigatewayv2-authorizers-alpha";
import * as cognito from "aws-cdk-lib/aws-cognito";

import UserPermissions from "../permission/user";

class CognitoPools {
  private _userPool: cognito.UserPool;
  private _identityPool: cognito.CfnIdentityPool;
  private _userPoolClient: cognito.UserPoolClient;
  private _authorizer: apigwAuthorizers.HttpUserPoolAuthorizer;
  private _permissions: UserPermissions;

  constructor(scope: Construct, id: string) {
    this._userPool = new cognito.UserPool(scope, `${id}-user-pool`, {
      userPoolName: `${id}-user-pool`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      passwordPolicy: {
        minLength: 6,
        requireLowercase: false,
        requireDigits: false,
        requireUppercase: false,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
    });

    this._userPoolClient = new cognito.UserPoolClient(
      scope,
      `${id}-user-pool-client`,
      {
        userPool: this._userPool,
        authFlows: {
          adminUserPassword: true,
          userPassword: true,
          custom: true,
          userSrp: true,
        },
        supportedIdentityProviders: [
          cognito.UserPoolClientIdentityProvider.COGNITO,
        ],
      }
    );

    this._authorizer = new apigwAuthorizers.HttpUserPoolAuthorizer(
      `${id}-user-pool-authorizer`,
      this._userPool,
      {
        userPoolClients: [this._userPoolClient],
        identitySource: ["$request.header.Authorization"],
      }
    );

    this._identityPool = new cognito.CfnIdentityPool(
      scope,
      `${id}-identity-pool`,
      {
        allowUnauthenticatedIdentities: true,
        cognitoIdentityProviders: [
          {
            clientId: this._userPoolClient.userPoolClientId,
            providerName: this._userPool.userPoolProviderName,
          },
        ],
      }
    );

    this._permissions = new UserPermissions(
      scope,
      id,
      this._userPool,
      this._userPoolClient,
      this._identityPool
    );

    new cognito.CfnUserPoolGroup(scope, "admin", {
      groupName: "admin",
      userPoolId: this._userPool.userPoolId,
      roleArn: this._permissions.authenticatedRole.roleArn,
    });

    new cdk.CfnOutput(scope, "UserPoolId", {
      value: this._userPool.userPoolId!,
    });

    new cdk.CfnOutput(scope, "UserPoolClientId", {
      value: this._userPoolClient.userPoolClientId!,
    });

    new cdk.CfnOutput(scope, "IdentityPoolId", {
      value: this._identityPool.ref,
    });
  }

  public get authorizer(): apigwAuthorizers.HttpUserPoolAuthorizer {
    return this._authorizer;
  }
}

export default CognitoPools;
