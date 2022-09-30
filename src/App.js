import "./App.css";
import React, { Fragment, useState } from "react";
import {
  Navbar,
  Form,
  Button,
  Container,
  Spinner,
  Card,
  Row,
  Col,
} from "react-bootstrap";
import axios from "axios";
import { Pie, Bar, Line } from "react-chartjs-2";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import Chart from 'chart.js/auto';

Chart.register(ChartDataLabels);

function App() {
  const [framework, setFramework] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);
  const [totalCommandsCount, setTotalCommandsCount] = useState(0);
  const [usedCommandsCount, setUsedCommandsCount] = useState(0);
  const [higherFrequency, setHigherFrequency] = useState(0);
  const [higherUsage, setHigherUsage] = useState(0);
  const [yearsList, setYearsList] = useState(null);

  const clear = () => {
    setFramework("");
    setEmail("");

    setData(null);
    setTotalCommandsCount(0);
    setUsedCommandsCount(0);
    setHigherFrequency(0);
    setHigherUsage(0);
  };

  const getUserCommand = (command) => {
    if (data) {
      return data.user.commands.find((cmd) => cmd.command === command);
    }
    return null;
  }

  const analyze = () => {
    if (!framework || !email) {
      alert("All fields are mandatory.");
    } else {
      setIsLoading(true);
      axios
        .post("http://localhost:3000/analyzer/user", {
          framework,
          email,
        })
        .then((resp) => {
          setData(resp.data);
          setTotalCommandsCount(resp.data.framework.commands.length);
          setUsedCommandsCount(resp.data.user.commands.length);

          let higherFrequencyCount = 0;
          let higherUsageCount = 0;
          resp.data.framework.commands.forEach((frameworkCmd) => {
            const cmd = getUserCommand(frameworkCmd.command);
            if (cmd?.averageFrequency >= frameworkCmd.averageFrequency) {
              higherFrequencyCount++;
            }
            if (cmd?.count >= frameworkCmd.averageUsage) {
              higherUsageCount++;
            }
          });
          setHigherUsage(higherUsageCount);
          setHigherFrequency(higherFrequencyCount);

          const years = [];
          years.push(...Object.keys(resp.data.framework.years));
          years.push(...Object.keys(resp.data.user.years));
          const yearsSet = new Set(years);
          yearsSet.delete("total");
          const list = [...yearsSet].sort();
          setYearsList(list);
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  return (
    <Container>
      <Navbar bg="light" expand="lg">
        <Navbar.Brand>FwkAnalyzer</Navbar.Brand>
      </Navbar>
      {!data && (
        <Form>
          <Form.Group>
            <Form.Label>Framework Name</Form.Label>
            <Form.Control
              as="select"
              value={framework}
              onChange={(e) => setFramework(e.target.value)}
            >
              <option>Select one available framework...</option>
              <option value="react">React</option>
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>Email</Form.Label>
            <Form.Control
              placeholder="example@email.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>

          <Button
            disabled={isLoading}
            variant="primary"
            onClick={analyze}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            {isLoading && <Spinner animation="border" role="status" />}
            Analyze
          </Button>
        </Form>
      )}

      {data && data.user && (
        <Fragment>
          <Button
            variant="primary"
            onClick={clear}
            style={{ marginTop: "1rem" }}
          >
            Clear
          </Button>
          <h1 style={{ marginTop: "2rem", marginBottom: "2rem" }}>{email}</h1>
          <Row>
            <Col xs={12} md={6} lg={6}>
              <Card>
                <Card.Header as="h5">Commands Usage</Card.Header>
                <Card.Body>
                  <Row>
                    <Col xs={12} md={6} lg={6}>
                      <h6 className="text-center">
                        The developer used{" "}
                        {(
                          (usedCommandsCount / totalCommandsCount) *
                          100
                        ).toFixed(2)}
                        % ({usedCommandsCount} of {totalCommandsCount}) of the
                        commands
                      </h6>
                      <Pie
                        plugins={[ChartDataLabels]}
                        data={{
                          labels: ["Used", "Not Used"],
                          datasets: [
                            {
                              data: [
                                usedCommandsCount,
                                totalCommandsCount - usedCommandsCount,
                              ],
                              backgroundColor: ["rgba(53, 162, 235, 0.5)", "rgba(255, 99, 132, 0.5)"],
                            },
                          ],
                        }}
                      />
                    </Col>
                    <Col xs={12} md={6} lg={6}>
                      <h6 className="text-center">
                        The general average coverage is{" "}
                        {(data.framework.averageCoverage * 100).toFixed(2)}%
                      </h6>
                      <Pie
                        plugins={[ChartDataLabels]}
                        data={{
                          labels: ["Used", "Not Used"],
                          datasets: [
                            {
                              data: [
                                (data.framework.averageCoverage * 100).toFixed(
                                  2
                                ),
                                100 -
                                  (
                                    data.framework.averageCoverage * 100
                                  ).toFixed(2),
                              ],
                              backgroundColor: ["rgba(53, 162, 235, 0.5)", "rgba(255, 99, 132, 0.5)"],
                            },
                          ],
                        }}
                      />
                    </Col>
                  </Row>
                  <Row style={{ justifyContent: "center", marginTop: "1rem" }}>
                    <h6>
                      The developer coverage is
                      {data.user.averageCoverage >
                      data.framework.averageCoverage
                        ? " GREATER "
                        : data.user.averageCoverage ===
                          data.framework.averageCoverage
                        ? " EQUAL "
                        : " LESS "}
                      than the general coverage
                    </h6>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} md={6} lg={6}>
              <Card>
                <Card.Header as="h5">Frequency</Card.Header>
                <Card.Body>
                  <Row>
                    <Col>
                      <h6 className="text-center">
                        The developer commands frequency is
                        {data.user.averageFrequency >
                        data.framework.averageFrequency
                          ? " GREATER "
                          : data.user.averageFrequency ===
                            data.framework.averageFrequency
                          ? " EQUAL "
                          : " LESS "}
                        than the general frequency
                      </h6>
                      <Bar
                        plugins={[ChartDataLabels]}
                        data={{
                          labels: ["Frequency (# per kLOC)"],
                          datasets: [
                            {
                              label: "User Commands' Frequency (# per kLOC)",
                              data: [
                                data.user.averageFrequency.toFixed(2),
                              ],
                              backgroundColor: "rgba(53, 162, 235, 0.5)",
                            },
                            {
                              label: "General Commands' Frequency (# per kLOC)",
                              data: [
                                data.framework.averageFrequency.toFixed(2),
                              ],
                              backgroundColor: "rgba(255, 99, 132, 0.5)",
                            },
                          ],
                        }}
                        options={{
                          title: {
                            display: true,
                            text: "Frequency (# per kLOC)",
                          },
                          legend: {
                            display: false,
                          },
                          scales: {
                            yAxes: [
                              {
                                ticks: {
                                  beginAtZero: true,
                                },
                              },
                            ],
                          },
                        }}
                      />
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card style={{ marginTop: "2rem" }}>
            <Card.Header as="h5">Commands Overview</Card.Header>
            <Card.Body>
              <Row>
                <Col>
                  <h6>Total Commands: {totalCommandsCount}</h6>
                  <h6>Used Commands: {usedCommandsCount}</h6>
                  <h6>
                    {higherFrequency} developer commands' frequency are
                    GREATER than the general
                  </h6>
                  <h6>
                    {higherUsage} developer commands' usage are GREATER than
                    general
                  </h6>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <h4 style={{ marginTop: "2rem", marginBottom: "1rem" }}>Commands</h4>

          <Row>
            {data.framework.commands.map((cmd, index) => {
              return (
                <Col key={index} xs={12} md={6} lg={4}>
                  <Card key={"card-" + index} style={{ marginTop: "1rem" }}>
                    <Card.Header as="h5">{cmd.command}</Card.Header>
                    <Card.Body>
                      <Row>
                        <Col>
                          <Bar
                            plugins={[ChartDataLabels]}
                            data={{
                              labels: ["Frequency (# per kLOC)"],
                              datasets: [
                                {
                                  label: "User",
                                  data: [
                                    getUserCommand(cmd.command)?.averageFrequency.toFixed(2),
                                  ],
                                  backgroundColor: "rgba(53, 162, 235, 0.5)",
                                },
                                {
                                  label: "Framework",
                                  data: [cmd.averageFrequency.toFixed(2)],
                                  backgroundColor: "rgba(255, 99, 132, 0.5)"
                                }
                              ],
                            }}
                            options={{
                              title: {
                                display: true,
                                text: "Frequency (# per kLOC)",
                              },
                              legend: {
                                display: false,
                              },
                              scales: {
                                yAxes: [
                                  {
                                    ticks: {
                                      beginAtZero: true,
                                    },
                                  },
                                ],
                              },
                            }}
                          />
                        </Col>
                        <Col>
                          <Bar
                            plugins={[ChartDataLabels]}
                            data={{
                              labels: ["Usage"],
                              datasets: [
                                {
                                  label: "User",
                                  data: [
                                    getUserCommand(cmd.command)?.count,
                                  ],
                                  backgroundColor: "rgba(53, 162, 235, 0.5)",
                                },
                                {
                                  label: "Framework",
                                  data: [
                                    cmd.averageUsage.toFixed(2)],
                                  backgroundColor: "rgba(255, 99, 132, 0.5)"
                                }
                              ],
                            }}
                            options={{
                              showAllTooltips: true,
                              title: {
                                display: true,
                                text: "Usage",
                              },
                              legend: {
                                display: false,
                              },
                              scales: {
                                yAxes: [
                                  {
                                    ticks: {
                                      beginAtZero: true,
                                    },
                                  },
                                ],
                              },
                            }}
                          />
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>

          {yearsList && (
            <Fragment>
              <h4 style={{ marginTop: "2rem", marginBottom: "1rem" }}>
                Usage in Years
              </h4>
              <Line options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }} data={{
                labels: yearsList,
                datasets: [
                  {
                    label: 'Developer Framework Usage',
                    data: yearsList.map(year => data.user.years[year] ? data.user.years[year].total : 0),
                    borderColor: 'rgb(53, 162, 235)',
                    backgroundColor: 'rgba(53, 162, 235, 0.5)',
                  },
                ]
              }} />
            </Fragment>
          )}
        </Fragment>
      )}
    </Container>
  );
}

export default App;
