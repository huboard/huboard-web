module Api
  class UploadsController < ApiController
    protect_from_forgery :except => [:local_uploader]

    def asset_uploader
      not_found unless logged_in?
      not_found unless Rails.application.config.client_environment["FEATURES"]["IMAGE_UPLOADS"]
      uploader = AssetUploader.new
      uploader.user = params[:user]
      uploader.repo = params[:repo]
      uploader.will_include_content_type = true
      uploader.success_action_status = '201'
      render json: {
        uploader: {
          key: uploader.key,
          aws_access_key_id: uploader.aws_access_key_id,
          acl: uploader.acl,
          policy: uploader.policy,
          signature: uploader.signature,
          upload_url: uploader.direct_fog_url,
          success_action_status: uploader.success_action_status
        }
      }
    end

    def local_uploader
      not_found unless logged_in?
      uploader = LocalUploader.new

      uploader.access_token = user_token
      uploader.user = params[:user]
      uploader.repo = params[:repo]
      
      uploader.store! params[:file]

      render xml: { "Key" => params[:file].original_filename, "Location" => uploader.url }
    end

  end
end
