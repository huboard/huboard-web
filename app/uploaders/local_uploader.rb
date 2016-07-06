# encoding: utf-8

class LocalUploader < CarrierWave::Uploader::Base
  storage CarrierWave::Storage::GitHub
  attr_accessor :access_token, :user, :repo
end

