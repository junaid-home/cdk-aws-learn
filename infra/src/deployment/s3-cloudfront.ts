import * as path from "path";
import * as cdk from "aws-cdk-lib";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { CloudFrontWebDistribution } from "aws-cdk-lib/aws-cloudfront";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";

export class WebAppDeployment {
  private stack: cdk.Stack;
  private bucketSuffix: string;
  private deploymentBucket: Bucket;

  constructor(stack: cdk.Stack, id: string, bucketSuffix: string) {
    this.stack = stack;
    this.bucketSuffix = bucketSuffix;
    this.initialize(id);
  }

  private initialize(id: string) {
    const bucketName = `${id}-bucket` + this.bucketSuffix;
    this.deploymentBucket = new Bucket(this.stack, `${id}-bucket`, {
      bucketName: bucketName,
      publicReadAccess: true,
      websiteIndexDocument: "index.html",
    });

    new BucketDeployment(this.stack, `${id}-bucket-deployment`, {
      destinationBucket: this.deploymentBucket,
      sources: [Source.asset(path.join(__dirname, "../../../client/build"))],
    });

    const cloudFront = new CloudFrontWebDistribution(
      this.stack,
      `${id}-cloudfront-distribution`,
      {
        originConfigs: [
          {
            behaviors: [
              {
                isDefaultBehavior: true,
              },
            ],
            s3OriginSource: {
              s3BucketSource: this.deploymentBucket,
            },
          },
        ],
      }
    );

    new cdk.CfnOutput(this.stack, "WebAppS3Url", {
      value: this.deploymentBucket.bucketWebsiteUrl,
    });

    new cdk.CfnOutput(this.stack, "WebAppCloudFrontUrl", {
      value: cloudFront.distributionDomainName,
    });
  }
}
