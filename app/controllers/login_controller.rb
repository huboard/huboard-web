class LoginController < ApplicationController
  layout false

  def logout
    warden.logout
    redirect_to "/"
  end
  
  def public
    session[:scope] = :public
    github_authenticate! :default
    warden.set_user(warden.user(:public), scope: :default)
    @user = gh.user
    @emails = @user.emails.all
    redirect_to params[:redirect_to] || "/dashboard"
  end

  def private
    session[:scope] = :private
    github_authenticate! :private
    warden.set_user(warden.user(:private), scope: :default)
    @user = gh.user
    @emails = @user.emails.all
    redirect_to params[:redirect_to] || "/dashboard"
  end

  def github
    session[:scope] = :default
    github_authenticate! :default
    redirect_to params[:redirect_to] || "/dashboard"
  end

  def github_callback
    warden.authenticate(scope: session[:scope].to_sym)
  end

  private
  def warden
    env['warden']
  end

end
