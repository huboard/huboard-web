module Api
  class IssuesController < ApiController

    def issue
      api = huboard.board(params[:user], params[:repo])
      render json: api.issue(params[:number])
    end

    def issues
      api = huboard.board(params[:user], params[:repo])
      render json: api.issues(params[:label], params[:options])
    end

    def details
      api = huboard.board(params[:user], params[:repo])
      render json: api.issue(params[:number]).activities
    end

    def open_issue
      @issue = huboard.board(params[:user],params[:repo]).create_issue params
      render json: @issue
    end

    def update_issue
      api = huboard.board(params[:user], params[:repo])
      @issue = api.issue(params[:number]).update(params)
      render json: @issue
    end

    def label_issue
      api = huboard.board(params[:user], params[:repo])
      @issue = api.issue(params[:number]).update(params)
      @label = params["selectedLabel"]
      render json: @issue
    end

    def unlabel_issue
      api = huboard.board(params[:user], params[:repo])
      @issue = api.issue(params[:number]).update(params)
      @label = params["selectedLabel"]
      render json: @issue
    end

    def close_issue
      user, repo, number = params[:user], params[:repo], params[:number]
      @issue = huboard.board(user, repo).issue(number).close
      render json: @issue
    end

    def reopen_issue
      user, repo, number = params[:user], params[:repo], params[:number]
      @issue = huboard.board(user, repo).issue(number).open
      render json: @issue
    end

    #TODO Implement create_comment in bridge
    def create_comment
      data = {body: params['markdown']}
      @issue =  huboard.board(params[:user], params[:repo]).
        issue(params[:number])
      @comment = gh.repos(params[:user], params[:repo]).
        issues(params[:number]).comments.create(data)
      render json: @comment
    end

    def update_comment
      api = huboard.board(params[:user], params[:repo])
      comment = api.comments(params[:comment][:id]).patch body: params[:comment][:body]
      render json: comment
    end

    def block
      api = huboard.board(params[:user], params[:repo])
      @issue = api.issue(params[:number]).blocked
      render json: @issue
    end

    def unblock
      api = huboard.board(params[:user], params[:repo])
      @issue = api.issue(params[:number]).unblocked
      render json: @issue
    end

    def ready
      api = huboard.board(params[:user], params[:repo])
      @issue = api.issue(params[:number]).ready
      render json: @issue
    end

    def unready
      api = huboard.board(params[:user], params[:repo])
      @issue = api.issue(params[:number]).unready
      render json: @issue
    end

    #Skipping quite a bit of event code on this one since the 
    #implementation is going to be a lot different
    def drag_card
      user, repo, number, order, column = params[:user], params[:repo], params[:number], params[:order], params[:column]
      @moved = params[:moved_columns] == 'true'
      issue = huboard.board(user, repo).issue(number)

      if issue['current_state']['name'] != '__nil__'
        @previous_column = issue['current_state']
      else
        @previous_column = huboard.board(user, repo).column_labels[0]
      end

      data = params[:data] || {}
      @issue = issue.move(column, order, @moved, data)
      if data['state']
        message = {
          :issue => @issue,
          'action_controller.params' => {'correlationId' => params['correlationId']},
          'current_user' => current_user.attribs || {}
        }
        generate_issue_event(data['state'], message)
      end
      render json: @issue
    end

    def archive_issue
      user, repo, number = params[:user], params[:repo], params[:number]
      @issue = huboard.board(user, repo).archive_issue(number)
      render json: @issue
    end

    def assign_issue
      user, repo, number, assignees = params[:user], params[:repo], params[:number], params[:assignees]
      issue = huboard.board(user, repo).issue(number)
      @assignee = params[:assignee] || assignees.first
      if issue['assignees']
        @issue = issue.add_assignees(assignees)
      else
        @issue = issue.patch('assignee' => @assignee)
      end
      render json: @issue
    end

    def unassign_issue
      user, repo, number, assignees = params[:user], params[:repo], params[:number], params[:assignees]
      issue = huboard.board(user, repo).issue(number)
      @assignee = params[:assignee] || assignees.first
      if issue['assignees']
        @issue = issue.remove_assignees(assignees)
      else
        @issue = issue.patch('assignee' => @assignee)
      end
      render json: @issue
    end

    def assign_milestone
      user, repo, number, milestone = params[:user], params[:repo], params[:number], params[:milestone]
      issue = huboard.board(user, repo).issue(number)
      issue.embed_data('milestone_order' => params[:order].to_f) if params[:order].to_f > 0
      @issue = issue.patch 'milestone' => milestone, 'body' => issue['body']
      @changed_milestones = params[:changed_milestones] == "true"
      render json: @issue
    end

    def status
      repo = gh.repos(params[:user], params[:repo])
      sha = repo.pulls(params[:number]).commits.last['sha']

      render json: repo.commits(sha).status
    end
  end
end
