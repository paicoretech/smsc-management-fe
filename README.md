# SMSC Management
This project was generated with Angular CLI version 17.0.0.


## Table of Contents
* Installation & Running the application
* Configuration .env
* Generate build
* Getting started
    * Requirements for development
    * Project structure
    * Folder structure
        * Auth
        * Core
        * Pages
        * Shared
        * Theme
        * Assets and Environments


## 💻 Installation & Running the application
### clone the repo
$ git clone git clone git@bitbucket.org:paicdb/smsc-management-fe.git

### go into app's directory
$ cd smsc-management-fe

### Generate Image docker

Check if the .env file exists and delete.

Configure environment variables in .env.example file, backend url and default values

Run the command

$ docker-compose up

### install app's dependencies

should be run the nvm use > .nvmrc to use the proper node/npm versions.

$ nvm use

after

$ npm install


### To run the project locally, run the following command:

install angular/cli

$install npm -g @angular/cli


Run the following command to launch the project

$ng serve


## 🧙 .env configuration

#### API URL Backend
* NG_APP_API_URL=http://18.224.164.85:9090

#### TimeOut for WebSockets

Websockets configuration to detect active sessions of service workers and gateways

* url web sockets
NG_APP_WEBSOCKET=ws://18.224.164.85:9090/app/status

* Observer Recharge Time
NG_APP_TIMEOUT_WEBSOCKET=1000

#### Filter Configuration
Controls the filters in the Analyze Log page. Both filters work independently:

* **NG_APP_FILTER_ONLY_SERVICE_PROVIDERS** - Controls the **Account** filter
  - Set to `true` to show only Service Providers (excludes Gateways)
  - Set to `false` to show all accounts (Service Providers and Gateways)
  - Default: `true`
  - Example: `NG_APP_FILTER_ONLY_SERVICE_PROVIDERS=true`

* **NG_APP_FILTER_ONLY_GATEWAYS** - Controls the **Destination Gateway** filter
  - Set to `true` to show only Gateways (excludes Service Providers)
  - Set to `false` to show all accounts (Service Providers and Gateways)
  - Default: `false`
  - Example: `NG_APP_FILTER_ONLY_GATEWAYS=true`

#### IP address regex

IP input validation regex in gateways form

NG_APP_PATTERN_IP=^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$

NG_APP_MAX_LENGTH_IP=30

NG_APP_PATTERN_SYSTEM_ID='^[^,\'"}{\]\[)(\"\\]+$'

NG_APP_PATTERN_SYSTEM_LABEL=",'}{][)(\"\\"

EMAIL input validation regex in service provider form
NG_APP_PATTERN_EMAIL=^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$


#### Variables for ServiceProviderDefaults


Service providers form default values

* NG_APP_SP_BIND_TYPE=TRANSCEIVER

* NG_APP_SP_INTERFACE_VERSION=IF_50

* NG_APP_SP_SESSIONS_NUMBER=1

* NG_APP_SP_ADDRESS_TON=0

* NG_APP_SP_ADDRESS_NPI=0

* NG_APP_SP_ADDRESS_RANGE_REGEX=^[0-9a-zA-Z]*$

* NG_APP_SP_BALANCE_TYPE=PREPAID

* NG_APP_SP_BALANCE=0

* NG_APP_SP_TPS=1

* NG_APP_SP_VALIDITY=0

* NG_APP_SP_STATUS=CLOSED

* NG_APP_SP_ENABLED=0

* NG_APP_SP_ENQUIRE_LINK_PERIOD=3000

* NG_APP_SP_PDU_TIMEOUT=5000

* NG_APP_SP_REQUEST_DLR=false

* NG_APP_SP_CONTACT_NAME='contact'

* NG_APP_SP_EMAIL='email@email.com'

* NG_APP_SP_PHONE_NUMBER=0 

* NG_APP_SP_PROTOCOL=SMPP

* NG_APP_SP_PRIORITY=MEDIUM

#### Variables for gateway SMPP

Gateway Form Default Values

* NG_APP_GA_BIND_TYPE=TRANSCEIVER

* NG_APP_GA_INTERFACE_VERSION=IF_50

* NG_APP_GA_SESSIONS_NUMBER=1

* NG_APP_GA_ADDRESS_TON=0

* NG_APP_GA_ADDRESS_NPI=0

* NG_APP_GA_TPS=1

* NG_APP_GA_STATUS=CLOSED

* NG_APP_GA_ENABLED=0

* NG_APP_GA_ENQUIRE_LINK_PERIOD=30000

* NG_APP_GA_BIND_TIMEOUT=5000

* NG_APP_GA_BIND_RETRY_PERIOD=10000

* NG_APP_GA_PDU_TIMEOUT=5000

* NG_APP_GA_PDU_DEGREE=1

* NG_APP_GA_THREAD_POOL_SIZE=100

* NG_APP_GA_REQUEST_DLR=false

* NG_APP_GA_PROTOCOL=SMPP

* NG_APP_GA_ENCODING_GSM7=0

* NG_APP_GA_ENCODING_ISO8859=3

* NG_APP_GA_ENCODING_UCS2=2

* NG_APP_GA_SPLIT_MESSAGE=false

* NG_APP_GA_SPLIT_SMPP_TYPE=TLV

#### Variables for Gateway SS7

* NG_APP_GA_SS7_STATUS=CLOSED

* NG_APP_GA_SS7_ENABLED=0

* NG_APP_GA_SS7_GLOBAL_TITLE=22220

* NG_APP_GA_SS7_GLOBAL_TITLE_INDICATOR=GT0100

* NG_APP_GA_SS7_TRANSLATION_TYPE=0

* NG_APP_GA_SS7_SMSC_SSN=8

* NG_APP_GA_SS7_HLR_SSN=6

* NG_APP_GA_SS7_MSC_SSN=8

* NG_APP_GA_SS7_MAP_VERSION=3

* NG_APP_GA_SPLIT_MESSAGE=false

#### Variables for Gateway SS7 M3UA Settings.

* NG_APP_GA_SS7_M3UA_CONNECT_DELAY=5000

* NG_APP_GA_SS7_M3UA_DELIVER_MESSAGE_THREAD_COUNT=1

* NG_APP_GA_SS7_M3UA_HEARTBEAT_TIME = 10000

* NG_APP_GA_SS7_M3UA_ROUTING_KEY_MANAGEMENT_ENABLED=true

* NG_APP_GA_SS7_M3UA_USE_LOWEST_BIT_FOR_LINK=false

* NG_APP_GA_SS7_M3UA_CC_DELAY_THRESHOLD_1=2.6

* NG_APP_GA_SS7_M3UA_CC_DELAY_THRESHOLD_2=2.5

* NG_APP_GA_SS7_M3UA_CC_DELAY_THRESHOLD_3=3.0

* NG_APP_GA_SS7_M3UA_CC_DELAY_BACK_TO_NORMAL_THRESHOLD_1=3.4

* NG_APP_GA_SS7_M3UA_CC_DELAY_BACK_TO_NORMAL_THRESHOLD_2=4.5

* NG_APP_GA_SS7_M3UA_CC_DELAY_BACK_TO_NORMAL_THRESHOLD_3=5.0

#### Variables for Gateway SS7 M3UA - Sockets

* NG_APP_GA_SS7_M3UA_SOCKET_TYPE = Client

#### Variables for Gateway SS7 SCCP Settings.

* NG_APP_GA_SS7_SCCP_ZMARGIN=240

* NG_APP_GA_SS7_SCCP_REMOVE_SPC=true

* NG_APP_GA_SS7_SCCP_SST_TIMER_MIN=10000

* NG_APP_GA_SS7_SCCP_SST_TIMER_MAX=6000000

* NG_APP_GA_SS7_SCCP_SST_TIMER_INCREASE_FACTOR=1.5

* NG_APP_GA_SS7_SCCP_MAX_DATA_MESSAGE=2560

* NG_APP_GA_SS7_SCCP_PERIOD_OF_LOGGING=60000

* NG_APP_GA_SS7_SCCP_REASSEMBLY_TIMER=15000

* NG_APP_GA_SS7_SCCP_PREVIEW_MODE=false

* NG_APP_GA_SS7_SCCP_SCCP_PROTOCOL_VERSION=ITU

* NG_APP_GA_SS7_SCCP_CONGESTION_CONTROL_TIMER_A=400

* NG_APP_GA_SS7_SCCP_CONGESTION_CONTROL_TIMER_D=2000

* NG_APP_GA_SS7_SCCP_CONGESTION_CONTROL_ALGORITHM=international

* NG_APP_GA_SS7_SCCP_CONGESTION_CONTROL_OUTGOING=false

#### Variable for TCAP - MAP Gateway SS7

* NG_APP_GA_SS7_TCAP_SSN_LIST=8

* NG_APP_GA_SS7_TCAP_PREVIEW_MODE=false

* NG_APP_GA_SS7_TCAP_DIALOG_TIMEOUT=100000

* NG_APP_GA_SS7_TCAP_INVOKE_TIMEOUT=25000

* NG_APP_GA_SS7_TCAP_DIALOG_RANGE_START=1

* NG_APP_GA_SS7_TCAP_DIALOG_RANGE_END=2147483647

* NG_APP_GA_SS7_TCAP_MAX_DIALOGS=5000

* NG_APP_GA_SS7_TCAP_DO_NOT_SEND=false

* NG_APP_GA_SS7_TCAP_SWAP_TCAP=true

* NG_APP_GA_SS7_TCAP_SLS_RANGE=All

* NG_APP_GA_SS7_TCAP_EXR_DELAY_THR1=1

* NG_APP_GA_SS7_TCAP_EXR_DELAY_THR2=6

* NG_APP_GA_SS7_TCAP_EXR_DELAY_THR3=12

* NG_APP_GA_SS7_TCAP_EXR_NORMAL_DELAY_THR1=0.5

* NG_APP_GA_SS7_TCAP_EXR_NORMAL_DELAY_THR2=3

* NG_APP_GA_SS7_TCAP_EXR_NORMAL_DELAY_THR3=8

* NG_APP_GA_SS7_TCAP_MEMORY_MONITOR_THR1=77

* NG_APP_GA_SS7_TCAP_MEMORY_MONITOR_THR2=87

* NG_APP_GA_SS7_TCAP_MEMORY_MONITOR_THR3=97

* NG_APP_GA_SS7_TCAP_MEM_NORMAL_DELAY_THR1=72

* NG_APP_GA_SS7_TCAP_MEM_NORMAL_DELAY_THR2=82

* NG_APP_GA_SS7_TCAP_MEM_NORMAL_DELAY_THR3=92

* NG_APP_GA_SS7_TCAP_BLOCKING_TCAP=false


* NG_APP_GA_SS7_MAP_SRI_SERVICE_OP_CODE=45

* NG_APP_GA_SS7_MAP_FORWARD_SM_SERVICE=44

#### Variables for Rules Service Provider

Service Provider Rules Form Defaults

* NG_APP_SOURCE_ADDR_TON=-1

* NG_APP_SOURCE_ADDR_NPI=-1

* NG_APP_DEST_ADDR_TON=-1

* NG_APP_DEST_ADDR_NPI=-1

#### Variables for General Settings
* NG_APP_G_SETTINGS_ENCODING_GSM7=0

* NG_APP_G_SETTINGS_ENCODING_ISO8859=3

* NG_APP_G_SETTINGS_ENCODING_UCS2=2

* NG_APP_G_SETTINGS_MAX_PASSWORD_LENGTH=9

* NG_APP_G_SETTINGS_MAX_SYSTEM_ID_LENGTH=15

#### Variables for Retries

* NG_APP_RETRY_MAX=300

* NG_APP_RETRY_DELAY=4

* NG_APP_RETRY_FIRST_DELAY=10

#### dtOptions for DataTables

* Datatable configuration, elements per page, and record options menu to display

* NG_APP_DT_PAGE_LENGTH=25

* NG_APP_DT_LENGTH_MENU=25,50,100

* NG_APP_DT_ORDER=desc

#### Smpp Server Listener Config

* NG_APP_SMPP_SERVER_STATUS=STOPPED

* NG_APP_SMPP_SERVER_ENABLED=0

## 💎 Generate Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.


## 📋 Getting started

Before starting, please make sure you have installed these programs.
    [Angular CLI](https://github.com/angular/angular-cli)

### Requirements for development
* Angular
* Nodejs v18.13.x

### Project structure
This part describes the folder structure for a Lazy-loading Angular project. The project is organized to separate concerns clearly and manage dependencies effectively.

### Folder structure

src/
|-- app/
|   |-- core/
|   |   |-- guards/
|   |   |-- interceptors/
|   |   |-- services/
|   |   |-- utils/
|   |
|   |-- auth/
|   |   └── ...
|   |-- pages/
|   |   |-- delivery-error-code/
|   |   |   └── ...
|   |   |-- error-code/
|   |   |   └── ...
|   |   |-- error-code-mappings/
|   |   |   └── ...
|   |   |-- gateways/
|   |   |   └── ...
|   |   |-- home/
|   |   |   └── ...
|   |   |-- mnos/
|   |   |   └── ...
|   |   |-- rules-service-providers/
|   |   |   └── ...
|   |   |-- service-providers/
|   |   |   └── ...
|   |   |-- settings/
|   |   |   └── ...
|   |
|   |-- shared/
|   |   |-- components/
|   |   |   |   └── ...
|   |   |   
|   |-- theme/
|   |   |-- layout/
|   |   |   |-- app-layout/
|   |   |   |   └── ...
|   |   |   |-- header/
|   |   |   |   └── ...
|   |   |   |-- sidebar/
|   |   |   |   └── ...
|
|-- assets/
|-- environments/

#### Core:
The core folder contains essential services, interceptors, guards, and global models. It includes:

* guards: Guards for user authentication.
* services: Global services like HttpService and StorageService.
* utils: Global utilities like Logger and DateUtils
* interceptors: Interceptors for HTTP requests and responses.

#### Pages:
Contains the platform modules:
* Delivery error code
* Error code
* Error code mapping
* Gateways
* Home
* MNOs
* Service Provider Rules
* Service providers
* Settings

#### Shared:

The shared folder includes reusable components, directives, and pipes.

#### Theme:

Contains the main structure of the content, layout, header, sidebar

#### Assets and Environments

* Assets: Static resources like images and global styles.

* Environments: Configuration for different environments (development, production).

#### env.d.t
Type declaration file that allows TypeScript to recognize the environment variables defined in your .env file and prevents it from displaying errors when you try to access them in your TypeScript code.