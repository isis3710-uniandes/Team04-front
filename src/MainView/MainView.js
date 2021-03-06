import React, { Component } from 'react';
import './MainView.css';
import ListLocations from './ListLocations.js';
import DatePicker from "react-datepicker";
import Stars from './Stars.js';
import Combobox from './Combobox.js';
import "react-datepicker/dist/react-datepicker.css";
import HostalData from './HostalData.js';
import ReactDOM from 'react-dom';
import Login from '../login/Login';
import MainApp from "../App";
import { IntlProvider, FormattedMessage } from 'react-intl';
import Auth from "../Auth";
import localeEsMessages from "../locales/es";
import localeEnMessages from "../locales/en";
import DataShowModel from '../DataShowModel';


const auth = new Auth()
class MainView extends Component {

    

    constructor(props) {
        super(props);
        this.state = {
            listLocations: [],
            fechaPartida: new Date(),
            fechaRegreso: new Date(),
            precioMaxNoche: 1008214,
            partida: 'Bogotá',
            llegada: 'Cartagena',
            user: "",
            viajeCreado: false,
            status: 'start',
            status2: 'start',
            resultadosBusqueda: [],
            openGraphModal: false
        }

        this.handleChangePartida = this.handleChangePartida.bind(this);
        this.handleChangeRegreso = this.handleChangeRegreso.bind(this);
        this.addLocation = this.addLocation.bind(this);
        this.compareHostales = this.compareHostales.bind(this);
        this.buscar = this.buscar.bind(this);
        this.renderBusqueda = this.renderBusqueda.bind(this);
        this.subViajes = this.subViajes.bind(this);
        this.CrearViaje = this.CrearViaje.bind(this);

        if (typeof this.props.usuario !== 'undefined') {
            if (this.props.usuario.logueado) {
                this.state.user = this.props.usuario;
            }
        }

        fetch('/hostales', {
            method: 'POST',
            body: JSON.stringify({
                "nombre": "Casa Hogar Hostales",
                "descripcion": "El centro de cartagena bien pinche bello",
                "precio": "100000",
                "telefono": "3002221234",
                "sitioWeb": "casahogar.com",
                "ciudad": "Cartagena",
                "direccion": "Calle 1 #10-22",
                "puntuacion": 5,
                "imagenes": ["//imgcy.trivago.com/c_lfill,d_dummy.jpeg,f_auto,h_225,q_auto:eco,w_225/itemimages/40/10/4010756.jpeg", "//imgcy.trivago.com/c_lfill,d_dummy.jpeg,f_auto,h_225,q_auto:eco,w_225/itemimages/90/11/9011312.jpeg", "//imgcy.trivago.com/c_lfill,d_dummy.jpeg,f_auto,h_225,q_auto:eco,w_225/itemimages/59/75/5975238.jpeg", "//imgcy.trivago.com/c_lfill,d_dummy.jpeg,f_auto,h_225,q_auto:eco,w_225/itemimages/41/05/4105462.jpeg", "//imgcy.trivago.com/c_lfill,d_dummy.jpeg,f_auto,h_225,q_auto:eco,w_225/itemimages/83/79/8379904.jpeg"]
            }),
            headers: { "Content-Type": "application/json" }
        })
            .then(function (response) {
                return response.json();
            }).then(function (body) {
            });


    }

    handleChangePartida(date) {
        this.setState({
            fechaPartida: date
        });
    }

    handleChangeRegreso(date) {
        this.setState({
            fechaRegreso: date
        });
    }
    renderLocations() {
        return this.state.listLocations.map((location, i) => {
            let userLang = navigator.language || navigator.userLanguage

            function getLocale() {
                return userLang.startsWith("es") ? localeEsMessages : localeEnMessages;
            }
            return (
                <IntlProvider locale={userLang} messages={getLocale()}>
                    <ListLocations data={location} key={i++}></ListLocations>
                </IntlProvider>);
        })
    }

    addLocation() {
        var partida = document.getElementById('inLocationPartida').value;
        var llegada = document.getElementById('inLocationLlegada').value;
        var fechaPartida = this.state.fechaPartida;
        var fechaRegreso = this.state.fechaRegreso;
        var tipoHabitacion = document.getElementById('controlHabitacion').value;
        var tipoTransporte = document.getElementById('controlTransporte').value;
        var data = { partida: partida, llegada: llegada, fechaPartida: fechaPartida, fechaRegreso: fechaRegreso, tipoHabitacion: tipoHabitacion, tipoTransporte: tipoTransporte }
        var locations = this.state.listLocations;
        locations.push(data);
        this.setState({
            listLocations: locations
        })
    }


    subViajes() {

        const arraySubViajes = this.state.listLocations;
        const subViajes2 = [];
        let i = 0;



        arraySubViajes.map(viaje => {

            let diaLlegada = viaje.fechaPartida.getDate();
            let monthLlegada = viaje.fechaPartida.getMonth();
            let yearLlegada = viaje.fechaPartida.getFullYear();
            let dateStringLlegada = diaLlegada + "-" + (monthLlegada + 1) + "-" + yearLlegada;

            let diaPartida = viaje.fechaRegreso.getDate();
            let monthPartida = viaje.fechaRegreso.getMonth();
            let yearPartida = viaje.fechaRegreso.getFullYear();
            let dateStringPartida = diaPartida + "-" + (monthPartida + 1) + "-" + yearPartida;
            const viaje2 = {
                nombre: "sub-viaje" + i,
                empresa: "empresa",
                metodoDeViaje: "Viaje " + viaje.tipoTransporte,
                fechaInicio: dateStringLlegada,
                fechaFin: dateStringPartida,
                origen: viaje.partida,
                destino: viaje.llegada,
            }
            subViajes2.push(viaje2);
        })

        return subViajes2;
    }
    CrearViaje() {
        let me = this;
        let subViajesact = this.subViajes();
        if (this.state.listLocations.length === 0) {
            
        }
        else {
            if (!auth.isAuthenticated()) {
                this.setState({ viajeCreado: "2" });
            }
            else {

                fetch('/viajes', {
                    method: 'POST',
                    body: JSON.stringify({
                        idUsuario: auth.getProfile().idToken,
                        nombre: "viaje1",
                        empresa: "empresa1",
                        fechaInicio: me.state.listLocations[0].fechaPartida,
                        fechaFin: me.state.listLocations.slice(-1).pop().fechaRegreso,
                        origen: me.state.listLocations[0].partida,
                        destino: me.state.listLocations.slice(-1).pop().llegada,
                        subViajes: subViajesact,
                        viajeAgendado: true
                    }),
                    headers: { "Content-Type": "application/json" }
                })
                    .then(function (response) {
                        me.setState({ viajeCreado: response.statusText });
                        return response.json();
                    }).then(function (body) {
                        me.state.viajeCreado = true;
                    });
            }

        }



    }

    buscar() {
        var llegada = document.getElementById('inLocationLlegada').value;
        fetch('/hostales/cities/' + llegada).then(response => {
            return response.json();
        }).then(hostalesByCity => {
            var array = []
            for (var hostal of hostalesByCity) {
                array.push(JSON.stringify(hostal));
            }
            this.setState({
                resultadosBusqueda: array
            });

            console.log("array en buscar: " + array);
        })
    }

    compareHostales(a, b) {
        if (a.precio < b.precio) {
            return -1;
        } else if (a.precio > b.precio) {
            return 1;
        } else { return 0 }
    }

    renderBusqueda() {

        return this.state.resultadosBusqueda.map((hostal, i) => {
            var data = JSON.parse(hostal)
            return (<HostalData data={data} id={i++} key={i++}></HostalData>);
        })
    }

    sendLogin() {

        let userLang = navigator.language || navigator.userLanguage

        function getLocale() {
            return userLang.startsWith("es") ? localeEsMessages : localeEnMessages;
        }
        ReactDOM.render(
            <IntlProvider locale={userLang} messages={getLocale()}>
                <Login />
            </IntlProvider>, document.getElementById("root"));
    }

    return(){
        let userLang = navigator.language || navigator.userLanguage

        function getLocale() {
            return userLang.startsWith("es") ? localeEsMessages : localeEnMessages;
        }
        
        ReactDOM.render(
        <IntlProvider locale={userLang} messages={getLocale()}>
            <MainApp />
        </IntlProvider>, document.getElementById("root"));
    }
    render() {

        let viajeConfirmation = false;
        if (this.state.viajeCreado === "Created") {

            viajeConfirmation = <FormattedMessage id="ViajeCreado" />;
        }
        else if (this.state.viajeCreado === "0") {
            viajeConfirmation = <FormattedMessage id="NoViajesAgg" />;
        }
        else if(this.state.viajeCreado === "2") {
            viajeConfirmation = <FormattedMessage id="noLogin" />;
        }
        let rend = (
            <div className="main" id="main" style={style}>
                
                <div  className="container-fluid" id="containerLoginButtons">
                    <button className="btn btn-primary" id="loginButton" type="button" onClick={auth.login} ><FormattedMessage id="Login/SignUp" /></button>
                    <button className="btn btn-primary" id="logoutButton" type="button" onClick={auth.logout} ><FormattedMessage id="logout" /></button>
                </div>
                <div className="bannerr" id="mainBanner">
                    <h1 className="appName" onClick={this.return.bind(this)}><a className="link" href="#main">MultiTravel</a></h1>
                </div>
                
                <div className="row contentMainView" id="contentMainView">
                    
                    <div className="col-sm-2 listSelectedLocations" id="divLugares">
                        <div className="card" id="cardLugares">
                            <div className="card-header">
                                <FormattedMessage id="LugaresSeleccionados" />
                            </div>
                            <ul className="list-group list-group-flush">
                                {this.renderLocations()}
                            </ul>


                            <div className="btn-agregarLocation button-lugares">
                                <button className="btn btn-primary" type="button" onClick={this.addLocation}> <FormattedMessage id="Agregar" /></button>
                                <br></br>
                            </div>
                            <div className="btn-CrearViaje button-lugares">
                                <button className="btn btn-primary" type="button" onClick={this.CrearViaje}> <FormattedMessage id="CrearViaje" /></button>
                            </div>

                            <small className="confirmation">{viajeConfirmation ? viajeConfirmation : ""}</small>

                        </div>
                    </div>

                    <div className="col-10 inputData text-left sele">
                        <div className="row">
                            <div className=" text-left col">
                                <label id="lbBuscarPartida" htmlFor="inLocationPartida"><FormattedMessage id="LugarPartida" /></label>

                                <div className="input-group md-form form-sm form-1 pl-0">
                                    <input id="inLocationPartida" className="form-control my-0 py-1" type="text" placeholder="Search" defaultValue={this.state.partida} aria-label="Search" />
                                </div>
                            </div>

                            <div className="text-left col">
                                <label id="lbBuscarLlegada"><FormattedMessage id="LugarLlegada" /></label>

                                <div className="input-group md-form form-sm form-1 pl-0">
                                    <div className="input-group-prepend">
                                    </div>
                                    <input id="inLocationLlegada" className="form-control my-0 py-1" type="text" placeholder="Search" defaultValue={this.state.llegada} aria-label="Search" />
                                </div>
                            </div>

                            <div className="text-left col">
                                <label id="lbBuscarFechaPartida" htmlFor="dateFechaPartida"><FormattedMessage id="FechaPartida" /></label>
                                <DatePicker id="dateFechaPartida"
                                    selected={this.state.fechaPartida}
                                    onChange={this.handleChangePartida}
                                />
                            </div>


                            <div className="text-left col-sm">
                                <label id="lbBuscarFechaRegreso" htmlFor="dateFechaRegreso"><FormattedMessage id="FechaSalida" /></label>
                                <DatePicker id="dateFechaRegreso"
                                    selected={this.state.fechaRegreso}
                                    onChange={this.handleChangeRegreso}
                                />
                            </div>

                            <div className="text-left col-sm">
                                <label id="lbBuscarTipoHabitacion" htmlFor="controlHabitacion"><FormattedMessage id="TipoHab" /></label>
                                <Combobox id="controlHabitacion" options={['Individual', 'Doble', 'Familiar', 'Múltiple']}></Combobox>
                            </div>

                            <div className="text-left col-sm">
                                <label id="lbBuscarTipoTransporte" htmlFor="controlTransporte"><FormattedMessage id="TipoTrans" /></label>
                                <Combobox id="controlTransporte" options={['Aire', 'Mar', 'Tierra']} ></Combobox>
                            </div>

                            <div className="text-left col-sm">
                                <button className="btn btn-primary" type="button" id="buscar" onClick={this.buscar}><FormattedMessage id="Buscar" /></button>
                            </div>
                            <div className="text-left col-sm">
                                <button type="button" className="btn btn-primary" onClick={(e) =>{this.setState({openGraphModal: !this.state.openGraphModal})}}>Ver Datos</button>
                            </div>

                        </div>
                        <div className="row ">
                            <div className="text-left col" id="precioMaxNoche">
                                <label id="lbBuscarPrecioNoche" htmlFor="formControlRange"><FormattedMessage id="Precio" /></label>
                                <div className="row">

                                    <input type="range" className="form-control-range col" id="formControlRange"></input>
                                    <label className="col">{this.state.precioMaxNoche}</label>
                                </div>
                            </div>

                            <div className="text-left col">
                                <Stars></Stars>
                            </div>

                            <div className=" text-left col">
                                <label id="labelPuntuacion" htmlFor="controlPuntuacion"><FormattedMessage id="Puntuacion" /></label>

                                <Combobox options={['8.5+', '7.5 - 8.4', '6.5 - 7.4', '5.5 - 6.4', '4.5 - 5.4', '3.5 - 4.4', '2.5 - 3.4', '1.5 - 2.4', '0 - 1.4']} id="controlPuntuacion"></Combobox>
                            </div>
                        </div>
                        <br></br>
                        <div className="card">
                            <div className="accordion" id="accordionResultados">
                                {/* {this.state.resultadosBusqueda} */}
                            </div>
                        </div>
                    </div>
                    
                    {this.renderBusqueda()} 
                </div>
               
            </div>
        )

        if(this.state.openGraphModal){
            rend = (<DataShowModel></DataShowModel>);
        }
        let style = {
            width: '100%',
            height: '100%'
        }
        return (
            <div style={style}>
                {rend}
            </div>
            
        )
    }
}
export default MainView;