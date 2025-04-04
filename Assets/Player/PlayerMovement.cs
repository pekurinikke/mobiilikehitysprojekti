using System;
using UnityEditor.Experimental.GraphView;
using UnityEngine;

public class PlayerMovement : MonoBehaviour
{
    public float acceleration;
    public float groundSpeed;
    public float jumpSpeed;

    public float groundDecay;
    public Rigidbody2D body;
    public BoxCollider2D groundCheck;
    public LayerMask groundMask;
    public bool grounded;
    float xInput;
    float yInput;
    public Joystick joystick;
    void Start()
    {

    }

    void Update()
    {
        GetInput();
        HandleJump();

    }
    void GetInput(){
        xInput = joystick.Horizontal;
        yInput = Input.GetAxis("Vertical");
    }
    void MoveWithInput(){
        if (Mathf.Abs(xInput) > 0){

            float increment = xInput * acceleration;
            float newSpeed = Mathf.Clamp(body.linearVelocityX + increment, -groundSpeed, groundSpeed);
            body.linearVelocity = new Vector2(newSpeed, body.linearVelocityY);

            float direction = Mathf.Sign(xInput);
            transform.localScale = new Vector3(direction, 1, 1);
        }
    }
    void HandleJump(){
        if (Input.GetButtonDown("Jump") && grounded){
            body.linearVelocity = new Vector2(body.linearVelocityX, jumpSpeed);
        }
    }

    void FixedUpdate()
    {
        CheckGround();
        ApplyFriction();
        MoveWithInput();
    }
     void CheckGround() {
            grounded = Physics2D.OverlapAreaAll(groundCheck.bounds.min, groundCheck.bounds.max, groundMask).Length > 0;
        }
    void ApplyFriction(){
        if (grounded && xInput == 0 && body.linearVelocityY <= 0) {
            body.linearVelocityX *= groundDecay;
        }
    }
}
