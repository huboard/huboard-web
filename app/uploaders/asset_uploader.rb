# encoding: utf-8

AssetUploader = Rails.application.config.client_environment["FEATURES"]["IMAGE_STORE"] == "aws" ?  AwsUploader : ApiUploader; 
