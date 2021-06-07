import { useState, useEffect, Fragment } from 'react';
import { Chart } from 'react-google-charts';
import {
  Paper,
  Grid,
  Container,
  Box,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Card,
  CardContent,
  Typography,
  CardHeader,
  CardMedia,
  CardActions,
  useMediaQuery,
} from '@material-ui/core';
import { ArrowBack, ArrowForward } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    minHeight: '100vh',
    backgroundImage: 'url(./weather-background.jpg)',
    paddingTop: '1rem',
    paddingBottom: '1rem',
    [theme.breakpoints.up('md')]: {
      paddingTop: '4rem',
      paddingBottom: '4rem',
    },
  },
  paper: {
    padding: theme.spacing(1),
    textAlign: 'center',
    display: 'flex',
    color: theme.palette.text.secondary,
    minHeight: 'calc(100vh - 2rem)',
    background: 'rgba(255,255,255,0.6)',
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(4),
      minHeight: 'calc(100vh - 4rem)',
  },
  },
  card: {
    minWidth: '38%',
    cursor: 'pointer',
    [theme.breakpoints.up('md')]: {
      minWidth: '28%',
    },
  },
  hidden: {
    visibility: 'hidden',
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
  },
}));

export default function Weather() {
  const matches = useMediaQuery('(min-width:960px)');
  const classes = useStyles();
  const [city, setCity] = useState(null);
  const [paginatedData, setPaginatedData] = useState(null);
  const [page, setPage] = useState(1);
  const [unit, setUnit] = useState('farenheit');
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const handleUnit = (event) => {
    setUnit(event.target.value);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const units = unit === 'celcius' ? 'metric' : 'imperial';
      const res = await fetch(
        'https://api.openweathermap.org/data/2.5/forecast?q=Munich,de&APPID=75f972b80e26f14fe6c920aa6a85ad57&cnt=40&units=' +
          units
      );
      const data = await res.json();
      let sectionalData = {};
      setLoading(false);
      data?.list?.forEach((e) => {
        if (sectionalData[e.dt_txt.split(' ')[0]]) {
          sectionalData[e.dt_txt.split(' ')[0]].push(e);
        } else {
          sectionalData[e.dt_txt.split(' ')[0]] = [e];
        }
      });
      if (selectedDate)
        setSelectedDate([selectedDate[0], sectionalData[selectedDate[0]]]);
      setPaginatedData({ ...sectionalData });
      setCity(data.city);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit]);

  return (
    <div className={classes.root}>
      <Container maxWidth='md'>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            {!loading && paginatedData && city ? (
              <Box
                display='flex'
                alignItems='center'
                width='100%'
                flexDirection='column'
              >
                <FormControl component='fieldset'>
                  <RadioGroup
                    aria-label='unit'
                    name='unit'
                    value={unit}
                    onChange={handleUnit}
                    row
                    width='100%'
                  >
                    <FormControlLabel
                      value='farenheit'
                      control={<Radio color='primary' />}
                      label='Farenheit'
                    />
                    <FormControlLabel
                      value='celcius'
                      control={<Radio color='primary' />}
                      label='Celcius'
                    />
                  </RadioGroup>
                </FormControl>
                <Box
                  display='flex'
                  width='100%'
                  justifyContent='space-around'
                  my={matches ? '1rem' : '.5rem'}
                >
                  <Button
                    className={page <= 1 ? classes.hidden : ''}
                    onClick={() => setPage(page - 1)}
                  >
                    <ArrowBack
                      style={{ fontSize: matches ? '64px' : '32px' }}
                    />
                  </Button>
                  <Button
                    className={
                      page < Object.entries(paginatedData).length - 2
                        ? ''
                        : classes.hidden
                    }
                    onClick={() => setPage(page + 1)}
                  >
                    <ArrowForward
                      style={{ fontSize: matches ? '64px' : '32px' }}
                    />
                  </Button>
                </Box>
                <Box
                  display='flex'
                  width='100%'
                  justifyContent='space-around'
                  my={matches ? '2rem' : '.5rem'}
                  flexWrap='wrap'
                >
                  {Object.entries(paginatedData)?.map((dailyData, index) => (
                    <Fragment key={dailyData[0]}>
                      {index >= page - 1 && index <= page + 1 ? (
                        <Card
                          onClick={() => setSelectedDate(dailyData)}
                          className={classes.card}
                          elevation={
                            selectedDate && selectedDate[0] === dailyData[0]
                              ? 6
                              : 0
                          }
                          variant={
                            selectedDate && selectedDate[0] !== dailyData[0]
                              ? 'outlined'
                              : 'elevation'
                          }
                        >
                          <CardHeader
                            title={city.name + ', ' + city.country}
                            subheader={new Intl.DateTimeFormat('en-GB', {
                              dateStyle: 'full',
                            }).format(new Date(dailyData[0]))}
                          />
                          {matches && (
                            <CardMedia
                              className={classes.media}
                              image={`https://openweathermap.org/themes/openweathermap/assets/vendor/owm/img/widgets/${dailyData[1][0]?.weather[0]?.icon}.png`}
                              title='Paella dish'
                            />
                          )}
                          <CardContent>
                            <Typography variant={'h3'} component='h2'>
                              {Math.round(
                                dailyData[1].reduce(
                                  (acc, e) => acc + e.main.temp,
                                  0
                                ) / dailyData[1].length
                              )}
                              °{unit === 'farenheit' ? 'F' : 'C'}
                            </Typography>
                          </CardContent>
                          <CardActions disableSpacing>
                            <Typography
                              variant={matches ? 'h6' : 'body1'}
                              component='h6'
                            >
                              {dailyData[1][0]?.weather[0]?.main}
                            </Typography>
                            &nbsp; ({dailyData[1][0]?.weather[0]?.description})
                          </CardActions>
                        </Card>
                      ) : null}
                    </Fragment>
                  ))}
                </Box>
                {selectedDate && (
                  <Chart
                    width={'100%'}
                    height={'300px'}
                    chartType='Bar'
                    loader={<div>Loading Chart</div>}
                    data={[
                      ['Time', 'Temperature'],
                      ...selectedDate[1]?.map((e) => [
                        e.dt_txt.split(' ')[1].substring(0, 5),
                        e.main.temp,
                      ]),
                    ]}
                    options={{
                      legend: { position: 'none' },
                    }}
                    // For tests
                    rootProps={{ 'data-testid': '2' }}
                  />
                )}
              </Box>
            ) : (
              <Box
                display='flex'
                alignItems='center'
                justifyContent='center'
                width='100%'
              >
                Loading...
              </Box>
            )}
          </Paper>
        </Grid>
      </Container>
    </div>
  );
}
