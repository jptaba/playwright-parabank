Feature: Parabank Login Healing
  Scenario: Healing when username selector is missing
    Given I open the login_heal page
    When I fill the "usernameBroken" with "john"
    When I fill the "password" with "demo"
    When I click the "submit"
    Then I should see the "overviewHeader"
