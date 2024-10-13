import express from "express";
import {UserModel} from "../models/user.js";

export async function createUser(req, res){
    try {
        const addingUserRecord = new UserModel(req.body)
        console.log(req.body);
        
        const insertUser = await addingUserRecord.save();
        res.status(201).send(insertUser);
    } catch (e) {
        res.status(400).send(e);
    }
}
 

export async function getAllUsers(req, res){
    try {
       const usuarios = await UserModel.find({})
        res.status(200).send(usuarios)
    } catch (e) {
        res.status(400).send(e)
    }
}

export async function getUserById(req, res){
    try {
       const _id = req.params.id;
       const usuario = await UserModel.findById(_id)
        res.status(200).send(usuario)
    } catch (e) {
        res.status(400).send(e)
    }   
}


export async function updateUser(req, res){
    try {
       const _id = req.params.id;
       const usuario = await UserModel.findByIdAndUpdate(_id, req.body, {new: true});
        res.status(200).send(usuario)
    } catch (e) {
        res.status(500).send(e)
    }   
}

export async function deleteUser(req, res){
    try {
       const _id = req.params.id;
       const usuario = await UserModel.findByIdAndDelete(_id);
        res.status(200).send('User deleted correctly')
    } catch (e) {
        res.status(500).send(e)
    }   
}

