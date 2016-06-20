# encoding: utf-8

AssetUploader = ENV["HUBOARD_ENV"] == "enterprise" ?  ApiUploader : AwsUploader; 
