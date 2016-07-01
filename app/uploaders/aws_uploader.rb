# encoding: utf-8

class AwsUploader < CarrierWave::Uploader::Base
  attr_accessor :user, :repo

  include CarrierWaveDirect::Uploader
end

