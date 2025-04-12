using System;
using UnityEditor.Experimental.GraphView;
using UnityEngine;

public class PlayerMovement : MonoBehaviour
{   
    // Singleton Instance
    public static PlayerMovement Instance { get; private set; }

    // Coin related variables
    [SerializeField] private int _coins;

    public float acceleration;
    public float groundSpeed;
    public float jumpSpeed;
    public float groundDecay;

    [Range(0f, 1f)]
    public Rigidbody2D body;
    public BoxCollider2D groundCheck;
    public LayerMask groundMask;
    public bool grounded;
    float xInput;
    float yInput;
    public Joystick joystick;

    private void Awake()
    {
        // Singleton pattern to ensure only one instance of PlayerMovement exists
        if (Instance == null)
        {
            Instance = this;
        }
        else
        {
            Destroy(gameObject);
        }
    }

    public void AddCoins()
    {
        _coins++;
        Debug.Log("Coins: " + _coins);
    }

    void Start()
    {
        _coins = 0;
    }

    void Update()
    {
        GetInput();
        HandleJump();
        UIManager.Instance.UpdateCoinText(_coins);
    }

   void OnTriggerEnter2D(Collider2D other)
{
    CoinCollectible coin = other.GetComponent<CoinCollectible>();
    if (coin != null && !coin.isCollected) // Ensure it's not already collected
    {
        _coins += coin.coinValue;
        coin.Collect();
        UIManager.Instance.UpdateCoinText(_coins);
    }
}

    void GetInput()
    {
        xInput = joystick.Horizontal;
        yInput = Input.GetAxis("Vertical");
    }

    void MoveWithInput()
    {
        if (Mathf.Abs(xInput) > 0)
        {
            float increment = xInput * acceleration;
            float newSpeed = Mathf.Clamp(body.linearVelocity.x + increment, -groundSpeed, groundSpeed);
            body.linearVelocity = new Vector2(newSpeed, body.linearVelocity.y);

            float direction = Mathf.Sign(xInput);
            transform.localScale = new Vector3(direction, 1, 1);
        }
    }

    void HandleJump()
    {
        if (Input.GetButtonDown("Jump") && grounded)
        {
            body.linearVelocity = new Vector2(body.linearVelocity.x, jumpSpeed);
        }
    }

    void FixedUpdate()
    {
        CheckGround();
        ApplyFriction();
        MoveWithInput();
    }

    void CheckGround()
    {
        grounded = Physics2D.OverlapAreaAll(groundCheck.bounds.min, groundCheck.bounds.max, groundMask).Length > 0;
    }

    void ApplyFriction()
    {
        if (grounded && xInput == 0 && body.linearVelocity.y <= 0)
        {
            body.linearVelocity = new Vector2(body.linearVelocity.x * groundDecay, body.linearVelocity.y);
        }
    }
}
