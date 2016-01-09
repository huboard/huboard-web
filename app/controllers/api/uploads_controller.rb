module Api
  class UploadsController < ApiController

    def asset_uploader
      not_found unless logged_in?
      not_found unless ENV['AWS_ENABLED']
      uploader = AssetUploader.new
      uploader.will_include_content_type = true
      uploader.success_action_status = '201'

      if ENV['AWS_S3_ENCRYPTED'] == 'true'
        policy = uploader.policy do |conditions|
          conditions << {"x-amz-server-side-encryption" => "AES256"}
          conditions << {"x-amz-server-side-encryption-aws-kms-key-id" => ENV['AWS_KMS_KEY_ID']} if ENV['AWS_KMS_KEY_ID']
          conditions << {'utf8' => '✓'}
        end
      else
        policy = uploader.policy
      end

      uploader = {
        key: uploader.key,
        aws_access_key_id: uploader.aws_access_key_id,
        acl: uploader.acl,
        policy: policy,
        signature: uploader.signature,
        upload_url: uploader.direct_fog_url,
        success_action_status: uploader.success_action_status
      }

      uploader.merge!(aws_kms_key_id: ENV['AWS_KMS_KEY_ID']) if ENV['AWS_KMS_KEY_ID']

      render json: {
        uploader: uploader
      }
    end

  end
end
