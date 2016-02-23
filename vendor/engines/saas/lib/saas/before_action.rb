module Saas
  module BeforeAction
    def check_account
      ## HACKS:? SPECIAL CHECK
      return if ["errors","saas/errors"].include? params[:controller]
      return  unless params.has_key?(:user) && params.has_key?(:repo)

      not_found if params[:user] == "site" && params[:repo] == "pubsub"

      repo = gh.repos(params[:user], params[:repo]).raw

      not_found unless repo.status == 200

      if github_authenticated?(:private) && repo.body["private"]
        UseCase::PrivateRepo.new(gh, couch).run(params).match do
          success do
            session[:forward_to] = "/#{params[:user]}/#{params[:repo]}"
            return redirect_to "/settings/#{params[:user]}/trial" if params[:trial_available]

            user = gh.users(params[:user])
            session[:github_login] = user['login']
          end
          failure :pass_through do
            return;
          end

          failure :unauthorized do
            if params[:subscription_canceled]
              throw :warden, action: 'unauthenticated_canceled'
            end

            if params[:trial_expired]
              throw :warden, action: 'unauthenticated_expired'
            end

            throw :warden, action: 'unauthenticated_saas'
          end
        end
      end

    end
  end
end
