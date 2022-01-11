import * as cdk from "aws-cdk-lib";
import { Bucket, HttpMethods } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

class Storage {
  private _bucker: Bucket;

  constructor(scope: Construct, id: string) {
    this._bucker = new Bucket(scope, `${id}-storage-bucker-s3`, {
      bucketName: `${id}-storage-bucker-s3`,
      cors: [
        {
          allowedMethods: [HttpMethods.HEAD, HttpMethods.GET, HttpMethods.PUT],
          allowedOrigins: ["*"],
          allowedHeaders: ["*"],
        },
      ],
    });

    new cdk.CfnOutput(scope, "s3-bucket-name", {
      value: this._bucker.bucketName,
    });
  }

  public get bucket(): Bucket {
    return this._bucker;
  }
}

export default Storage;
