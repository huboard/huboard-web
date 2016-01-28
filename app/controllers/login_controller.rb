class LoginController < ApplicationController
  layout false
  def logout
    request.env['warden'].logout 
    redirect_to "/"
  end
  def public
    request.env['warden'].logout if github_authenticated? :private
    github_authenticate! :default
    @user = gh.user
    @emails = gh.user.emails
    redirect_to params[:redirect_to] || "/"
  end
  def private
    request.env['warden'].logout if github_authenticated? :default
    github_authenticate! :private
    @user = gh.user
    @emails = gh.user.emails
    redirect_to params[:redirect_to] || "/"
  end
end
