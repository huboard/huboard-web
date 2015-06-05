module Enterprise
  module BeforeAction
    def is_license_valid?
      return false unless File.exists? "/opt/huboard-license/license.yml"
      license = YAML.load_file(File.join("/opt/huboard-license/license.yml"))
      license["expires_on"] > Date.today 
    end
    def check_account
      return if ["errors","enterprise/errors"].include? params[:controller]

      not_found if params[:user] == "site" && params[:repo] == "pubsub"

      unless is_license_valid?
        throw :warden, action: 'unauthenticated_enterprise'
      end
    end
  end
end

