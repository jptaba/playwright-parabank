Feature: Parabank Login
  As a user
  I want to log in to the Parabank site
  So that I can access my account

  Scenario: Successful login with valid credentials
    Given I open the login page
    When I fill the "username" with "john"
    When I fill the "password" with "demo"
    When I click the "submit"
    Then I should see the "overviewHeader"
