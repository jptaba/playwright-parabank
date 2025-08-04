Feature: Parabank Login
  As a user
  I want to log in to the Parabank site
  So that I can access my account

  Scenario: Successful login with valid credentials
    Given I am on the Parabank login page
    When I log in with valid credentials
    Then I should see the account overview page
    And I log out
