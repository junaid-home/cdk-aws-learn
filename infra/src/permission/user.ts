import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as cognito from "aws-cdk-lib/aws-cognito";

import Storage from "../storage/s3";

class UserPermissions {
  private _authenticatedRole: iam.Role;
  private _unAuthenticatedRole: iam.Role;
  private _storage: Storage;

  constructor(
    scope: Construct,
    id: string,
    userPool: cognito.UserPool,
    userPoolClient: cognito.UserPoolClient,
    identityPool: cognito.CfnIdentityPool
  ) {
    this._storage = new Storage(scope, id);

    this._authenticatedRole = new iam.Role(
      scope,
      `${id}-cognito-authenticated-role`,
      {
        assumedBy: new iam.FederatedPrincipal(
          "cognito-identity.amazonaws.com",
          {
            StringEquals: {
              "cognito-identity.amazonaws.com:aud": identityPool.ref,
            },
            "ForAnyValue:StringLike": {
              "cognito-identity.amazonaws.com:amr": "authenticated",
            },
          },
          "sts:AssumeRoleWithWebIdentity"
        ),
      }
    );

    this._unAuthenticatedRole = new iam.Role(
      scope,
      `${id}-cognito-unauthenticated-role`,
      {
        assumedBy: new iam.FederatedPrincipal(
          "cognito-identity.amazonaws.com",
          {
            StringEquals: {
              "cognito-identity.amazonaws.com:aud": identityPool.ref,
            },
            "ForAnyValue:StringLike": {
              "cognito-identity.amazonaws.com:amr": "unauthenticated",
            },
          },
          "sts:AssumeRoleWithWebIdentity"
        ),
      }
    );

    new cognito.CfnIdentityPoolRoleAttachment(scope, "${id}-roles-attachment", {
      identityPoolId: identityPool.ref,
      roles: {
        authenticated: this._authenticatedRole.roleArn,
        unauthenticated: this._unAuthenticatedRole.roleArn,
      },
      roleMappings: {
        adminsMapping: {
          type: "Token",
          ambiguousRoleResolution: "AuthenticatedRole",
          identityProvider: `${userPool.userPoolProviderName}:${userPoolClient.userPoolClientId}`,
        },
      },
    });

    this._authenticatedRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["s3:PutObject", "s3:PutObjectAcl"],
        resources: [this._storage.bucket.bucketArn + "/*"],
      })
    );
  }

  public get authenticatedRole(): iam.Role {
    return this._authenticatedRole;
  }
}

export default UserPermissions;
