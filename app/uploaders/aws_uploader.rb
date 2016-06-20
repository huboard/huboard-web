# encoding: utf-8

class AwsUploader < CarrierWave::Uploader::Base
  include CarrierWaveDirect::Uploader
end

