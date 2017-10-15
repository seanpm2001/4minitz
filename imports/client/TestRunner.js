/* USAGE INSTRUCTION:
 To call tests: simply import the TestRunner into your .js file and use the run method of this class
 To add tests: have a look at the TestCase class. Simply add more tests by expanding the createTestCases-Method.
 To add new scenarios triggering tests: simply add an unique identifier for your scenario to TestRunner.TRIGGERS, then create your tests.
 */
import {ConfirmationDialogFactory} from '../../client/helpers/confirmationDialogFactory';

export class TestRunner {
    static TRIGGERS = { // if you want to add new scenarios triggering test, add one unique string identifier here.
        finalize: 'finalize',
        sendAgenda: 'sendAgenda'
    };

    static generateList(selectedTrigger){
        if (TestCase.testCases.length === 0) {
            TestCase.createTestCases();
        }

        //filter test cases
        let selectedTests = TestCase.testCases.filter((testCase) => {
            return (testCase.triggers.includes(selectedTrigger) &&
            (testCase.condition()));
        });

        return selectedTests;
    }

    static run(selectedTrigger, testObject, callbackOnSuccess) {
        //create test cases
        if (TestCase.testCases.length === 0) {
            TestCase.createTestCases();
        }

        //filter test cases
        let selectedTests = TestCase.testCases.filter((testCase) => {
            return (testCase.triggers.includes(selectedTrigger) &&
            (testCase.condition()));
        });

        //execute tests
        let errors = [];
        selectedTests.forEach((selectedTest) => {
            let error = selectedTest.test(testObject);
            if (error) {
                errors.push(error);
            }
        });

        //check if errors occured
        if (errors.length === 0) {
            callbackOnSuccess();
        } else {
            let errorList = "";
            errors.forEach(error => {
                console.log(error)
                errorList += '-' + error + '\n';
            });
            ConfirmationDialogFactory.makeWarningDialogWithTemplate(
                callbackOnSuccess,
                'Minute quality warning',
                'confirmPlainText',
                { plainText: 'Got some errors bois \n' + errorList + 'Do you want to proceed?'},
                'Proceed'
            ).show();
        }
    }
}

class TestCase {
    static testCases = [];

    constructor(testName, triggers, condition, test) {
        this.testName = testName; //name of the test for list generation
        this.triggers = triggers; //to determine to which scenarios applies
        this.condition = condition; //checks if the test is to be run at all. For future purposes e.g. disabling tests via settings
        this.test = test; // the test itself. Receives the minute object as a parameter, returns a string if the test fails, otherwise undefined
    }

    static createTestCases() {
        // to add tests simply push a new TestCase Object to the testCases property

        // no topics in minute (F) (A)
        TestCase.testCases.push(new TestCase('No topics in minute',
            [TestRunner.TRIGGERS.finalize, TestRunner.TRIGGERS.sendAgenda],
            () => {return true;},
            (minute) => {
                if (!minute.topics || minute.topics.length === 0)
                    return 'This minute has no topics';
            }
        ));

        // no participant marked as present (F)
        TestCase.testCases.push(new TestCase('No participants marked as present',
            TestRunner.TRIGGERS.finalize,
            () => {return true;},
            (minute) => {
                let noParticipantsPresent = true;
                minute.participants.forEach(p => {
                    if(p.present) noParticipantsPresent = false;
                    }
                );
                if(noParticipantsPresent)
                    return 'No participant is marked as present'
            }
        ));

        // no topics checked (F)
        TestCase.testCases.push(new TestCase('No topic is checked',
            TestRunner.TRIGGERS.finalize,
            () => {return true;},
            (minute) => {
                if(minute.topics.length < 0) return;
                let noTopicChecked = true;
                minute.topics.forEach(topic => {
                        if(!topic.isOpen) noTopicChecked = false;
                    }
                );
                if(noTopicChecked)
                    return 'No topic is checked'
            }
        ));

        // topic checked but no children (F)
        TestCase.testCases.push(new TestCase('A topic is checked but has no children',
            TestRunner.TRIGGERS.finalize,
            () => {return true;},
            (minute) => {
                if(minute.topics.length < 0) return;

                let checkedButChildren = false;
                minute.topics.forEach(topic => {
                        if(topic.isOpen) return;
                        if(!topic.infoItems || topic.infoItems.length === 0) checkedButChildren = true;
                    }
                );
                if(checkedButChildren)
                    return 'A topic is checked but has no children'
            }
        ));

        // action item with no responsible (F)
        TestCase.testCases.push(new TestCase('Action item has no responsible',
            TestRunner.TRIGGERS.finalize,
            () => {return true;},
            (minute) => {
                if(minute.topics.length < 0) return;

                let actionItemWithoutResponsible = false;
                minute.topics.forEach(topic => {
                    topic.infoItems.forEach(infoItem => {
                            if(infoItem.itemType === "actionItem" && ((!infoItem.responsibles) || (infoItem.responsibles.length === 0)))
                                actionItemWithoutResponsible = true;
                        });
                });
                if(actionItemWithoutResponsible)
                    return 'An action item has no responsible'
                }
            ));

        // Topic checked, but no updated or new content (F)
        /* uncomment when details get a isNew-Property for easier code
        TestCase.testCases.push(new TestCase('Topic is checked, but has no updated or new content',
            TestRunner.TRIGGERS.finalize,
            () => {return true;},
            (minute) => {
                if(minute.topics.length < 0) return;
                let noNewContent = true;
                minute.topics.forEach(topic => {
                    console.log(topic)
                    if(topic.isNew) { // topic is new
                        noNewContent = false;
                        return;
                    }

                    topic.infoItems.forEach(infoItem => {
                        if(infoItem.isNew) { // infoItem is new
                            noNewContent = false;
                            return;
                        }

                        if(!infoItem.isSticky) return; // only sticky infoItems can have new content in their details
                            infoItem.details.forEach(detail => { // detail is new
                               if(detail.isNew)
                                   noNewContent = true;
                            });

                        });
                });
                if(!noNewContent)
                    return 'A topic is checked but has no new content'
            }
        ));
        */
    }
}