import * as cdk from 'aws-cdk-lib'
import CfnStack from './stack/stack'

const app = new cdk.App()

new CfnStack(app, 'coursal', {
    stackName: 'coursal-stack'
})
