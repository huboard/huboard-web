class LoginController < ApplicationController
  layout false
  def logout
    request.env['warden'].logout 
    redirect_to "/"
  end
  def public
    github_authenticate! :default
    @user = gh.user
    @emails = @user.emails.all
    redirect_to params[:redirect_to] || "/dashboard"
  end
  def private
    github_authenticate! :private
    @user = gh.user
    @emails = @user.emails.all
    redirect_to params[:redirect_to] || "/dashboard"
  end
end
